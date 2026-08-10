import time

from pymongo import MongoClient, ASCENDING, DESCENDING

from features.clustering import ClusteringService


class IssueRepository:
    def __init__(self, mongo_uri: str, eps_km: float = 7.0, min_samples: int = 3):
        self.client = MongoClient(mongo_uri)
        self.db = self.client["ecoguard_twitter"]
        self.issues = self.db["issues"]
        self.settings = self.db["settings"]
        self.eps_km = eps_km
        self.min_samples = min_samples

    # ─── Konfigurasi clustering (disimpan di MongoDB, berlaku runtime) ───

    def get_clustering_settings(self) -> dict:
        """Baca setting clustering dari collection 'settings'.

        Fallback ke nilai env saat service start bila belum pernah disimpan.
        """
        doc = self.settings.find_one({"_id": "clustering"})
        if not doc:
            return {
                "eps_km": self.eps_km,
                "min_pts": self.min_samples,
                "source": "env-default",
            }
        return {
            "eps_km": float(doc.get("eps_km", self.eps_km)),
            "min_pts": int(doc.get("min_pts", self.min_samples)),
            "source": "mongodb",
            "updated_at": int(doc.get("updated_at", 0)),
        }

    def save_clustering_settings(self, eps_km: float, min_pts: int) -> dict:
        """Simpan setting clustering (upsert doc `_id = "clustering"`)."""
        doc = {
            "_id": "clustering",
            "eps_km": float(eps_km),
            "min_pts": int(min_pts),
            "updated_at": int(time.time()),
        }
        self.settings.replace_one({"_id": "clustering"}, doc, upsert=True)
        return {
            "eps_km": doc["eps_km"],
            "min_pts": doc["min_pts"],
            "source": "mongodb",
            "updated_at": doc["updated_at"],
        }

    def list_issues(self, status="", type_filter="", keyword="", created_after=0, page=1, per_page=20):
        query = {}
        if status:
            query["status"] = status
        if type_filter:
            query["type"] = type_filter
        if keyword:
            query["$or"] = [
                {"paraphrased_text": {"$regex": keyword, "$options": "i"}},
                {"type": {"$regex": keyword, "$options": "i"}},
                {"tweet_id": {"$regex": keyword, "$options": "i"}},
                {"location.address": {"$regex": keyword, "$options": "i"}},
            ]
        if created_after > 0:
            query["created_at"] = {"$gte": created_after}
        total = self.issues.count_documents(query)
        items = list(
            self.issues.find(query)
            .sort("created_at", DESCENDING)
            .skip((page - 1) * per_page)
            .limit(per_page)
        )
        return items, total

    def get_issue(self, issue_id: str) -> dict | None:
        # Rust serde renames id -> _id; query by _id
        return self.issues.find_one({"_id": issue_id})

    def list_clusters(self):
        """Run DBSCAN clustering on all issues with valid locations.

        eps/min_pts dibaca dari settings MongoDB saat runtime sehingga
        perubahan via /setup/clustering langsung berlaku tanpa restart.
        """
        s = self.get_clustering_settings()
        clustering = ClusteringService(eps_km=s["eps_km"], min_samples=s["min_pts"])
        all_issues = list(self.issues.find({
            "location": {"$ne": None},
            "location.lat": {"$ne": None},
            "location.lon": {"$ne": None},
        }))
        return clustering.cluster_from_db(all_issues)

    def get_total_issues(self) -> int:
        return self.issues.count_documents({})

    def get_open_issues(self) -> int:
        return self.issues.count_documents({"status": "open"})

    def get_resolved_issues(self) -> int:
        return self.issues.count_documents({"status": "resolved"})

    def get_issues_by_type(self) -> dict[str, int]:
        pipeline = [
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        ]
        result: dict[str, int] = {}
        for item in self.issues.aggregate(pipeline):
            t = item.get("_id") or "unknown"
            result[t] = int(item.get("count", 0))
        return result

    def get_recent_issues(self, limit: int = 5) -> list[dict]:
        cursor = self.issues.find().sort("created_at", DESCENDING).limit(limit)
        return list(cursor)

    def get_recent_tweets(self, limit: int = 5) -> list[dict]:
        # ponytail: tweets dari service lain (twitter-service) — query DB langsung karena share MongoDB
        tweets = self.db["tweets"]
        cursor = tweets.find().sort("created_at", DESCENDING).limit(limit)
        return list(cursor)

    def get_total_tweets(self) -> int:
        tweets = self.db["tweets"]
        return tweets.count_documents({})

    def get_word_cloud(self) -> list[dict]:
        """Aggregate issue types + locations as word count items."""
        pipeline = [
            # Type count
            {"$group": {"_id": "$type", "count": {"$sum": 1}}},
            {"$project": {"word": "$_id", "count": 1, "_id": 0}},
        ]
        type_counts = list(self.issues.aggregate(pipeline))

        # Address count
        pipeline2 = [
            {"$match": {"location.address": {"$ne": None, "$ne": ""}}},
            {"$group": {"_id": "$location.address", "count": {"$sum": 1}}},
            {"$project": {"word": "$_id", "count": 1, "_id": 0}},
        ]
        addr_counts = list(self.issues.aggregate(pipeline2))

        # Paraphrased text word frequency
        pipeline3 = [
            {"$match": {"paraphrased_text": {"$ne": ""}}},
        ]
        texts = [doc["paraphrased_text"] for doc in self.issues.aggregate(pipeline3)]

        word_freq: dict[str, int] = {}
        for t in texts:
            for w in t.lower().split():
                w = w.strip(".,!?")
                if len(w) > 3:
                    word_freq[w] = word_freq.get(w, 0) + 1

        # Merge: type + address (static weights) + word frequency
        result: list[dict] = []
        for item in type_counts:
            result.append({"word": item["word"], "count": item["count"] * 10})
        for item in addr_counts:
            result.append({"word": item["word"], "count": item["count"] * 5})
        for word, count in word_freq.items():
            result.append({"word": word, "count": count})

        # Sort by count desc, take top 30
        result.sort(key=lambda x: x["count"], reverse=True)
        return result[:30]
