"""
ClusteringService — business logic for geocoding + DBSCAN clustering.
Analogous to ClassificationService in classification-service.
"""

import json
import re
from pathlib import Path
from collections import Counter

from features.openstreet.geocoder import Geocoder
from .infer import DBSCANEngine, haversine_km


class ClusteringService:
    """Orchestrate: load tweets → extract location → geocode → cluster → summarize."""

    def __init__(self, eps_km: float = 7.0, min_samples: int = 3, redis_url: str = "redis://localhost:6379/0"):
        self.engine = DBSCANEngine(eps_km=eps_km, min_samples=min_samples)
        self.models_dir = Path(__file__).parent / "models"
        self.geocoder = Geocoder(redis_url=redis_url)

    def load_tweets(self, json_path: str | None = None) -> list[dict]:
        """Load scraped tweets from JSON file. Default: models/tweets.json."""
        path = Path(json_path) if json_path else self.models_dir / "tweets.json"
        if not path.exists():
            raise FileNotFoundError(
                f"Tweets file not found: {path}\n"
                f"Copy hasil scraping ke: {self.models_dir / 'tweets.json'}"
            )
        with open(path) as f:
            return json.load(f)

    def extract_location(self, text: str) -> str | None:
        """Extract location mention from tweet text."""
        patterns = [
            r'di\s+([A-Z][a-zA-Z]+)',
            r'dekat\s+([A-Z][a-zA-Z]+)',
            r'daerah\s+([A-Z][a-zA-Z]+)',
            r'([A-Z][a-zA-Z]+)\s*[,-]?\s*Indonesia',
        ]
        for pat in patterns:
            m = re.search(pat, text)
            if m:
                return m.group(1)
        return None

    def geocode(self, place: str) -> dict | None:
        """Place name → (lat, lon) via cached OpenStreetMap."""
        return self.geocoder.geocode(place)

    def process_tweets(self, json_path: str | None = None) -> dict:
        """Full pipeline: load → extract → geocode → cluster → return results."""
        tweets = self.load_tweets(json_path)

        # Extract + geocode
        points = []
        for t in tweets:
            # Support both tweet format (text) and news format (title)
            text = t.get("text") or t.get("title") or ""
            # Support both direct location_mention and extraction from text
            place = t.get("location_mention") or self.extract_location(text)
            if not place:
                continue
            coord = self.geocode(place)
            if coord:
                points.append({
                    "text": text[:150],
                    "place": place,
                    "lat": coord["lat"],
                    "lon": coord["lon"],
                    "display_name": coord["name"],
                })

        if len(points) < 3:
            return {"error": f"Too few geocoded points ({len(points)}), need ≥3", "points": len(points)}

        coords = [(p["lat"], p["lon"]) for p in points]
        labels = self.engine.fit_predict(coords)

        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        n_noise = labels.count(-1)

        # Per-cluster breakdown
        clusters = {}
        for i, lbl in enumerate(labels):
            if lbl == -1:
                continue
            clusters.setdefault(lbl, {"lats": [], "lons": [], "texts": [], "places": []})
            clusters[lbl]["lats"].append(coords[i][0])
            clusters[lbl]["lons"].append(coords[i][1])
            clusters[lbl]["texts"].append(points[i]["text"])
            clusters[lbl]["places"].append(points[i]["place"])

        cluster_list = []
        for cid in sorted(clusters.keys()):
            d = clusters[cid]
            clat = sum(d["lats"]) / len(d["lats"])
            clon = sum(d["lons"]) / len(d["lons"])
            radius = max(haversine_km(clat, clon, d["lats"][i], d["lons"][i]) for i in range(len(d["lats"])))
            top_places = [p for p, _ in Counter(d["places"]).most_common(3)]
            cluster_list.append({
                "cluster_id": int(cid),
                "centroid": {"lat": round(clat, 4), "lon": round(clon, 4)},
                "count": len(d["lats"]),
                "radius_km": round(radius, 1),
                "top_places": top_places,
                "samples": d["texts"][:3],
            })

        sil = self.engine.silhouette_score(coords, labels) if n_clusters > 1 else 0.0

        return {
            "total_tweets": len(tweets),
            "geocoded_points": len(points),
            "clusters": n_clusters,
            "clustered": len(points) - n_noise,
            "clustered_pct": round((len(points) - n_noise) / len(points) * 100, 1),
            "noise": n_noise,
            "noise_pct": round(n_noise / len(points) * 100, 1),
            "silhouette_score": round(sil, 4) if n_clusters > 1 else None,
            "silhouette_label": self._sil_label(sil) if n_clusters > 1 else None,
            "cluster_details": cluster_list,
        }

    def _sil_label(self, score: float) -> str:
        if score >= 0.7:
            return "excellent"
        elif score >= 0.5:
            return "good"
        elif score >= 0.25:
            return "reasonable"
        return "weak"

    def cluster_from_db(self, issues: list[dict]) -> list[dict]:
        """Cluster issues langsung dari MongoDB (via ListClusters)."""
        valid = [i for i in issues if i.get("location") and i["location"].get("lat")]
        if not valid:
            return []
        coords = [(i["location"]["lat"], i["location"]["lon"]) for i in valid]
        labels = self.engine.fit_predict(coords)

        for issue, label in zip(valid, labels):
            issue["cluster_id"] = label

        # Summarize
        clusters = {}
        for issue in valid:
            cid = issue.get("cluster_id")
            if cid is None or cid < 0:
                continue
            loc = issue["location"]
            clusters.setdefault(cid, {"lats": [], "lons": [], "types": set(), "addresses": set()})
            clusters[cid]["lats"].append(loc["lat"])
            clusters[cid]["lons"].append(loc["lon"])
            clusters[cid]["types"].add(issue.get("type", "unknown"))
            if loc.get("address"):
                clusters[cid]["addresses"].add(loc["address"])

        result = []
        for cid, d in clusters.items():
            result.append({
                "cluster_id": cid,
                "lat": sum(d["lats"]) / len(d["lats"]),
                "lon": sum(d["lons"]) / len(d["lons"]),
                "issue_count": len(d["lats"]),
                "types": sorted(d["types"]),
                "addresses": sorted(d["addresses"])[:5],
            })
        result.sort(key=lambda x: x["issue_count"], reverse=True)
        return result


if __name__ == "__main__":
    import json
    svc = ClusteringService()
    result = svc.process_tweets()
    if "error" in result:
        print(f"❌ {result['error']}")
    else:
        print(json.dumps(result, indent=2))
