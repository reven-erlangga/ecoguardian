"""Test project: Flask API untuk clustering DBSCAN (scikit-learn)."""

from flask import Flask, jsonify, request

import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score

app = Flask(__name__)


def parse_points(raw):
    """Terima list titik dalam bentuk [x, y, ...] atau {"x": ..., "y": ...}."""
    points = []
    for item in raw:
        if isinstance(item, (list, tuple)):
            if len(item) < 2:
                raise ValueError("setiap titik minimal punya 2 koordinat")
            points.append([float(v) for v in item])
        elif isinstance(item, dict):
            if "x" not in item or "y" not in item:
                raise ValueError("titik bertipe dict harus punya key 'x' dan 'y'")
            points.append([float(item["x"]), float(item["y"])])
        else:
            raise ValueError(f"format titik tidak dikenal: {item!r}")
    return np.array(points)


def _dbscan_quality_score(points, labels):
    """Skor kualitas hasil clustering DBSCAN.

    Return (score, n_clusters, n_noise, silhouette):
      - silhouette: rata-rata silhouette score di atas titik non-noise
        (tidak terdefinisi jika cluster < 2, maka dianggap 0).
      - coverage  : proporsi titik yang TIDAK dianggap noise.
      - score     = silhouette * coverage  ->  kompak & terpisah (silhouette
        tinggi) sekaligus sesedikit mungkin titik terbuang sebagai noise.
    """
    mask = labels != -1
    n_noise = int((~mask).sum())
    n_clusters = len(np.unique(labels[mask]))
    if n_clusters < 2:
        return -1.0, n_clusters, n_noise, 0.0
    sil = float(silhouette_score(points[mask], labels[mask]))
    coverage = float(mask.mean())
    return sil * coverage, n_clusters, n_noise, sil


def grid_search_dbscan(points, eps_values, min_samples_values, metric="euclidean"):
    """Grid search kombinasi eps x min_samples.

    Return (results, best):
      - results: list dict {eps, min_samples, n_clusters, n_noise,
        silhouette, score}, diurutkan dari skor tertinggi.
      - best   : dict terbaik + "labels" (label tiap titik, -1 = noise)
        dan "params".
    """
    results = []
    best = {"score": -float("inf")}
    for eps in eps_values:
        for min_samples in min_samples_values:
            labels = DBSCAN(eps=eps, min_samples=min_samples, metric=metric).fit_predict(
                points
            )
            score, n_clusters, n_noise, sil = _dbscan_quality_score(points, labels)
            row = {
                "eps": float(eps),
                "min_samples": int(min_samples),
                "n_clusters": n_clusters,
                "n_noise": n_noise,
                "silhouette": sil,
                "score": score,
            }
            results.append(row)
            if score > best["score"]:
                best = {
                    **row,
                    "labels": labels.tolist(),
                    "params": {
                        "eps": float(eps),
                        "min_samples": int(min_samples),
                        "metric": metric,
                    },
                }
    results.sort(key=lambda r: r["score"], reverse=True)
    return results, best


def _split_labels(labels):
    clusters = {}
    noise = []
    for idx, label in enumerate(labels):
        if label == -1:
            noise.append(idx)
        else:
            clusters.setdefault(str(label), []).append(idx)
    return clusters, noise


@app.post("/cluster")
def cluster():
    """POST /cluster

    Body (JSON):
      {
        "points": [[x, y], ...] | [{"x": ..., "y": ...}, ...],
        "eps": 0.5,            # wajib
        "min_samples": 5,      # opsional, default 5
        "metric": "euclidean"  # opsional
      }

    Response:
      {
        "labels":     [0, 0, -1, 1, ...],      # -1 = noise
        "clusters":   {"0": [0, 1], "1": [3, 4]},  # index titik per cluster
        "noise":      [2],                     # index titik noise
        "n_clusters": 2,
        "n_points":   5,
        "n_noise":    1,
        "params":     {"eps": 0.5, "min_samples": 5, "metric": "euclidean"}
      }
    """
    body = request.get_json(silent=True)
    if not body or "points" not in body:
        return jsonify({"error": "body wajib berisi 'points' dan 'eps'"}), 400

    try:
        eps = float(body["eps"])
        min_samples = int(body.get("min_samples", 5))
        metric = body.get("metric", "euclidean")
        points = parse_points(body["points"])
    except (KeyError, TypeError, ValueError) as exc:
        return jsonify({"error": f"param tidak valid: {exc}"}), 400

    if len(points) == 0:
        return jsonify({"error": "'points' tidak boleh kosong"}), 400
    if eps <= 0 or min_samples < 1:
        return jsonify({"error": "'eps' harus > 0 dan 'min_samples' >= 1"}), 400

    try:
        labels = DBSCAN(eps=eps, min_samples=min_samples, metric=metric).fit_predict(points)
    except ValueError as exc:
        return jsonify({"error": f"DBSCAN gagal: {exc}"}), 400

    clusters, noise = _split_labels(labels.tolist())

    return jsonify(
        {
            "labels": labels.tolist(),
            "clusters": clusters,
            "noise": noise,
            "n_clusters": len(clusters),
            "n_points": len(points),
            "n_noise": len(noise),
            "params": {"eps": eps, "min_samples": min_samples, "metric": metric},
        }
    )


@app.post("/optimize")
def optimize():
    """POST /optimize

    Grid search kombinasi Epsilon (eps) dan MinPts (min_samples) untuk
    menemukan parameter paling optimal dalam membentuk klaster sekaligus
    mengidentifikasi data noise.

    Body (JSON):
      {
        "points": [[x, y], ...] | [{"x": ..., "y": ...}, ...],  # wajib
        # Epsilon: beri daftar eksplisit ATAU rentang:
        "eps_values": [0.5, 1.0, 1.5],          # ATAU
        "eps_min": 0.1, "eps_max": 2.0, "eps_steps": 20,
        # MinPts: beri daftar eksplisit ATAU rentang:
        "min_samples_values": [2, 3, 4],        # ATAU
        "min_samples_min": 2, "min_samples_max": 10,
        "metric": "euclidean"                   # opsional
      }

    Response:
      {
        "best":      {"eps", "min_samples", "n_clusters", "n_noise",
                      "silhouette", "score", "params"},
        "labels":    [0, 0, -1, ...],       # label titik utk kombinasi terbaik
        "clusters":  {"0": [0, 1], ...},
        "noise":     [2, ...],              # index titik noise (terbaik)
        "n_clusters": 2, "n_noise": 1, "n_points": 5,
        "grid_size": 40,
        "results":   [ {eps, min_samples, n_clusters, n_noise,
                         silhouette, score}, ... ]  # semua kombinasi, skor turun
      }
    """
    body = request.get_json(silent=True)
    if not body or "points" not in body:
        return jsonify({"error": "body wajib berisi 'points'"}), 400

    try:
        points = parse_points(body["points"])
        metric = body.get("metric", "euclidean")

        eps_values = body.get("eps_values")
        if eps_values is None:
            eps_min = float(body["eps_min"])
            eps_max = float(body["eps_max"])
            eps_steps = int(body.get("eps_steps", 20))
            if eps_steps < 2:
                raise ValueError("'eps_steps' minimal 2")
            eps_values = np.linspace(eps_min, eps_max, eps_steps).tolist()
        else:
            eps_values = [float(v) for v in eps_values]

        min_samples_values = body.get("min_samples_values")
        if min_samples_values is None:
            ms_min = int(body.get("min_samples_min", 2))
            ms_max = int(body.get("min_samples_max", 10))
            min_samples_values = list(range(ms_min, ms_max + 1))
        else:
            min_samples_values = [int(v) for v in min_samples_values]
    except (KeyError, TypeError, ValueError) as exc:
        return jsonify({"error": f"param tidak valid: {exc}"}), 400

    if len(points) == 0:
        return jsonify({"error": "'points' tidak boleh kosong"}), 400
    if not eps_values:
        return jsonify({"error": "perlu 'eps_values' atau 'eps_min'/'eps_max'"}), 400
    if any(e <= 0 for e in eps_values):
        return jsonify({"error": "'eps' harus > 0"}), 400
    if not min_samples_values or any(m < 1 for m in min_samples_values):
        return jsonify({"error": "'min_samples' harus >= 1"}), 400

    try:
        results, best = grid_search_dbscan(points, eps_values, min_samples_values, metric)
    except ValueError as exc:
        return jsonify({"error": f"DBSCAN gagal: {exc}"}), 400

    best_params = best["params"]
    clusters, noise = _split_labels(best["labels"])
    best_info = {
        k: round(v, 6) if isinstance(v, float) else v
        for k, v in best.items()
        if k not in ("labels", "params")
    }
    best_info["params"] = best_params

    return jsonify(
        {
            "best": best_info,
            "labels": best["labels"],
            "clusters": clusters,
            "noise": noise,
            "n_clusters": len(clusters),
            "n_noise": len(noise),
            "n_points": len(points),
            "grid_size": len(results),
            "results": [
                {k: (round(v, 6) if isinstance(v, float) else v) for k, v in row.items()}
                for row in results
            ],
        }
    )


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
