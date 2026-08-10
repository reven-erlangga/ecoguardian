"""Optimasi parameter DBSCAN (Epsilon & MinPts) dari file dataset.

Membaca data dari file CSV/JSON, menjalankan grid search kombinasi
eps x min_samples, lalu melaporkan kombinasi optimal + titik noise.
Dua metrik jarak tersedia:
  - euclidean : jarak lurus; eps dalam satuan data (derajat utk lat/lon).
  - haversine : jarak geodesik di permukaan bumi; eps dalam KILOMETER.

Contoh penggunaan:
    python optimize_from_file.py --file data.csv
    python optimize_from_file.py --file data.json --eps-min 0.1 --eps-max 2.0 \
        --eps-steps 20 --min-samples-min 2 --min-samples-max 8 --top 10
    python optimize_from_file.py --file dataset/flood_dataset_classification.csv \
        --metric haversine --eps-min 5 --eps-max 160 --eps-steps 20
"""

import argparse
import csv
import json

import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.neighbors import NearestNeighbors

from app import _split_labels, grid_search_dbscan, parse_points

EARTH_RADIUS_KM = 6371.0
KM_PER_DEGREE = 111.0  # 1 derajat lintang ~ 111 km (untuk konversi tampilan)


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def load_points(path, x_col=None, y_col=None):
    """Baca titik dari file .csv atau .json.

    Untuk CSV, kolom koordinat bisa ditentukan via --x-col/--y-col (nama kolom
    atau index). Jika tidak, Latitude/Longitude dideteksi otomatis dari header;
    fallback ke dua kolom pertama yang numerik.
    """
    if path.endswith(".csv"):
        with open(path, newline="", encoding="utf-8") as f:
            rows = [row for row in csv.reader(f) if row]
        if not rows:
            raise SystemExit(f"file kosong: {path}")

        def is_numeric_row(row):
            return len(row) >= 2 and all(_to_float(v) is not None for v in row[:2])

        header = rows[0] if not is_numeric_row(rows[0]) else None
        data = rows[1:] if header else rows
        if not data:
            raise SystemExit(f"tidak ada baris data di {path}")

        def resolve(col, default):
            if col is None:
                return default
            if isinstance(col, str) and not col.isdigit():
                if header is None:
                    raise SystemExit(
                        f"file {path} tidak punya header; gunakan index numerik untuk --x-col/--y-col"
                    )
                low = {h.strip().lower(): i for i, h in enumerate(header)}
                key = col.strip().lower()
                if key not in low:
                    raise SystemExit(f"kolom '{col}' tidak ditemukan di header: {header}")
                return low[key]
            return int(col)

        xi = resolve(x_col, 0)
        yi = resolve(y_col, 1)

        # Auto-detect Latitude/Longitude bila kolom tidak ditentukan eksplisit.
        if x_col is None and y_col is None and header is not None:
            low = [h.strip().lower() for h in header]
            lat = next((i for i, h in enumerate(low) if h in ("latitude", "lat")), None)
            lon = next(
                (i for i, h in enumerate(low) if h in ("longitude", "lon", "long")), None
            )
            if lat is not None and lon is not None:
                xi, yi = lat, lon

        points = []
        for row in data:
            try:
                x = float(row[xi])
                y = float(row[yi])
            except (IndexError, ValueError):
                continue  # baris dengan koordinat tidak valid -> dilewati
            points.append([x, y])
        if not points:
            raise SystemExit(f"tidak ada titik numerik valid pada kolom terpilih dari {path}")

        if header is not None:
            print(f"Kolom X: {header[xi]}, Kolom Y: {header[yi]}")
        return np.array(points)

    if path.endswith(".json"):
        with open(path, encoding="utf-8") as f:
            return parse_points(json.load(f))
    raise SystemExit("format tidak didukung: gunakan file .csv atau .json")


def estimate_eps_range(points, k=2, p_low=5.0, p_high=95.0):
    """Estimasi rentang eps (euclidean) via metode k-distance.

    Jarak ke tetangga ke-k dihitung utk tiap titik; persentil p_low dan p_high
    dari k-distance tersebut dijadikan batas bawah & atas eps.
    """
    if len(points) < 3:
        raise SystemExit("butuh minimal 3 titik untuk estimasi eps")
    k = max(1, min(k, len(points) - 1))
    nn = NearestNeighbors(n_neighbors=k).fit(points)
    distances, _ = nn.kneighbors(points)
    k_dist = np.sort(distances[:, -1])
    # Koordinat duplikat menghasilkan jarak 0; abaikan agar persentil > 0.
    positive = k_dist[k_dist > 0]
    if positive.size == 0:
        raise SystemExit(
            "semua k-distance = 0 (titik duplikat sempurna); tentukan --eps-min/--eps-max manual"
        )
    eps_min = float(np.percentile(positive, p_low))
    eps_max = float(np.percentile(positive, p_high))
    if eps_max <= eps_min:
        eps_max = max(float(positive.max()), eps_min * 2)
    return eps_min, eps_max


def haversine_distance_km(points_deg):
    """Matriks jarak haversine (km) antar titik lat/lon (derajat)."""
    lat = np.radians(points_deg[:, 0])
    lon = np.radians(points_deg[:, 1])
    cos_lat = np.cos(lat)
    n = len(lat)
    dist = np.empty((n, n), dtype=np.float64)
    for i in range(n):
        dlat = lat[i] - lat
        dlon = lon[i] - lon
        a = np.sin(dlat / 2.0) ** 2 + cos_lat[i] * cos_lat * np.sin(dlon / 2.0) ** 2
        dist[i] = EARTH_RADIUS_KM * 2.0 * np.arcsin(np.sqrt(np.clip(a, 0.0, 1.0)))
    return dist


def estimate_eps_range_km(points_deg, k=2, p_low=5.0, p_high=95.0):
    """Estimasi rentang eps (haversine, km) via metode k-distance."""
    if len(points_deg) < 3:
        raise SystemExit("butuh minimal 3 titik untuk estimasi eps")
    k = max(1, min(k, len(points_deg) - 1))
    rad = np.radians(points_deg)
    nn = NearestNeighbors(n_neighbors=k, metric="haversine").fit(rad)
    distances, _ = nn.kneighbors(rad)
    k_dist = np.sort(distances[:, -1]) * EARTH_RADIUS_KM  # radian -> km
    positive = k_dist[k_dist > 0]
    if positive.size == 0:
        raise SystemExit(
            "semua k-distance = 0 (titik duplikat sempurna); tentukan --eps-min/--eps-max (km) manual"
        )
    eps_min = float(np.percentile(positive, p_low))
    eps_max = float(np.percentile(positive, p_high))
    if eps_max <= eps_min:
        eps_max = max(float(positive.max()), eps_min * 2)
    return eps_min, eps_max


def grid_search_haversine(dist_km, eps_km_values, min_samples_values):
    """Grid search eps (km) x min_samples dgn matriks jarak haversine.

    Return (results, best) — format sama seperti grid_search_dbscan.
    """
    results = []
    best = {"score": -float("inf")}
    for eps_km in eps_km_values:
        for min_samples in min_samples_values:
            labels = DBSCAN(
                eps=eps_km, min_samples=min_samples, metric="precomputed"
            ).fit_predict(dist_km)
            mask = labels != -1
            n_noise = int((~mask).sum())
            n_clusters = len(np.unique(labels[mask]))
            if n_clusters < 2:
                score, sil = -1.0, 0.0
            else:
                sub = dist_km[np.ix_(mask, mask)]
                sil = float(silhouette_score(sub, labels[mask], metric="precomputed"))
                score = sil * float(mask.mean())
            row = {
                "eps": float(eps_km),
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
                        "eps": float(eps_km),
                        "min_samples": int(min_samples),
                        "metric": "haversine",
                    },
                }
    results.sort(key=lambda r: r["score"], reverse=True)
    return results, best


def main():
    parser = argparse.ArgumentParser(
        description="Grid search optimasi parameter DBSCAN (eps & min_samples)."
    )
    parser.add_argument("--file", required=True, help="file dataset (.csv / .json)")
    parser.add_argument("--x-col", help="kolom koordinat X (nama atau index; default: auto-detect Latitude)")
    parser.add_argument("--y-col", help="kolom koordinat Y (nama atau index; default: auto-detect Longitude)")
    parser.add_argument(
        "--metric", choices=["euclidean", "haversine"], default="euclidean",
        help="metrik jarak; haversine = eps dalam km (default: euclidean)",
    )
    parser.add_argument(
        "--eps-min", type=float,
        help="batas bawah eps (default: estimasi k-distance); satuan: derajat utk euclidean, km utk haversine",
    )
    parser.add_argument(
        "--eps-max", type=float,
        help="batas atas eps (default: estimasi k-distance); satuan: derajat utk euclidean, km utk haversine",
    )
    parser.add_argument("--eps-steps", type=int, default=20, help="jumlah nilai eps (default: 20)")
    parser.add_argument("--min-samples-min", type=int, default=2, help="MinPts terkecil (default: 2)")
    parser.add_argument("--min-samples-max", type=int, default=10, help="MinPts terbesar (default: 10)")
    parser.add_argument("--k", type=int, default=2, help="k utk estimasi eps (default: 2)")
    parser.add_argument("--top", type=int, default=10, help="jumlah kombinasi terbaik yg dicetak (default: 10)")
    parser.add_argument("--out", default="results_optimize.csv", help="file CSV hasil grid search")
    args = parser.parse_args()

    points = load_points(args.file, x_col=args.x_col, y_col=args.y_col)
    print(f"Dataset  : {args.file}  ({len(points)} titik)")
    print(f"Metrik   : {args.metric}")

    min_samples_values = list(range(args.min_samples_min, args.min_samples_max + 1))

    if args.metric == "haversine":
        eps_unit = "km"
        fmt_eps = "{:.2f}"
        print(f"(eps dalam km; 1 km ~= {1.0 / KM_PER_DEGREE:.5f} derajat lat)")
        dist_km = haversine_distance_km(points)
        print(f"(matriks jarak haversine {dist_km.shape[0]}x{dist_km.shape[1]} selesai dihitung)")
        if args.eps_min is None or args.eps_max is None:
            est_min, est_max = estimate_eps_range_km(points, k=args.k)
            print(f"(eps diestimasi dari k-distance haversine k={args.k}: "
                  f"persentil 5%={est_min:.1f} km, 95%={est_max:.1f} km)")
            eps_min = args.eps_min if args.eps_min is not None else est_min
            eps_max = args.eps_max if args.eps_max is not None else est_max
        else:
            eps_min, eps_max = args.eps_min, args.eps_max
        if eps_min <= 0 or eps_max <= eps_min:
            raise SystemExit(f"rentang eps tidak valid (km): [{eps_min}, {eps_max}]")
        eps_values = np.linspace(eps_min, eps_max, args.eps_steps).tolist()
        print(f"Grid     : eps = {args.eps_steps} nilai di [{eps_min:.1f}, {eps_max:.1f}] km")
        print(f"           min_samples = {min_samples_values}")
        results, best = grid_search_haversine(dist_km, eps_values, min_samples_values)
    else:
        eps_unit = "derajat"
        fmt_eps = "{:.4f}"
        if args.eps_min is None or args.eps_max is None:
            est_min, est_max = estimate_eps_range(points, k=args.k)
            print(f"(eps diestimasi dari k-distance k={args.k}: "
                  f"persentil 5%={est_min:.4f}, 95%={est_max:.4f})")
            eps_min = args.eps_min if args.eps_min is not None else est_min
            eps_max = args.eps_max if args.eps_max is not None else est_max
        else:
            eps_min, eps_max = args.eps_min, args.eps_max
        if eps_min <= 0 or eps_max <= eps_min:
            raise SystemExit(f"rentang eps tidak valid (derajat): [{eps_min}, {eps_max}]")
        eps_values = np.linspace(eps_min, eps_max, args.eps_steps).tolist()
        print(f"Grid     : eps = {args.eps_steps} nilai di [{eps_min:.4f}, {eps_max:.4f}] derajat")
        print(f"           min_samples = {min_samples_values}")
        results, best = grid_search_dbscan(points, eps_values, min_samples_values, metric="euclidean")

    # ---- Laporan kombinasi optimal ----
    print("\n=== PARAMETER OPTIMAL (DBSCAN) ===")
    if args.metric == "haversine":
        print(f"eps            : {best['eps']:.2f} km  (≈ {best['eps'] / KM_PER_DEGREE:.2f}° ekuivalen derajat)")
    else:
        print(f"eps            : {best['eps']:.4f} derajat  (≈ {best['eps'] * KM_PER_DEGREE:.1f} km ekuivalen)")
    print(f"min_samples    : {best['min_samples']}")
    print(f"n_clusters     : {best['n_clusters']}")
    print(f"n_noise        : {best['n_noise']} ({100.0 * best['n_noise'] / len(points):.1f}% dari data)")
    print(f"silhouette     : {best['silhouette']:.6f}")
    print(f"score          : {best['score']:.6f}  (silhouette x coverage non-noise)")

    noise_idx = [i for i, l in enumerate(best["labels"]) if l == -1]
    if noise_idx:
        print(f"\n=== DATA NOISE (index titik berlabel -1, {len(noise_idx)} titik) ===")
        print(noise_idx[:100], "..." if len(noise_idx) > 100 else "")
    else:
        print("\nTidak ada data noise pada kombinasi optimal.")

    # ---- Tabel kombinasi terbaik ----
    print(f"\n=== TOP {args.top} KOMBINASI (dari {len(results)}) ===")
    header = ("eps", "min_samples", "n_clusters", "n_noise", "silhouette", "score")
    print(f"{'eps':>10} {'min_samples':>12} {'n_clusters':>10} "
          f"{'n_noise':>8} {'silhouette':>11} {'score':>10}   satuan eps: {eps_unit}")
    for row in results[: args.top]:
        print(f"{fmt_eps.format(row['eps']):>10} {row['min_samples']:>12d} {row['n_clusters']:>10d} "
              f"{row['n_noise']:>8d} {row['silhouette']:>11.6f} {row['score']:>10.6f}")

    # ---- Simpan hasil ----
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(header) + ["is_best"])
        writer.writeheader()
        for row in results:
            writer.writerow(
                {
                    **row,
                    "is_best": (
                        1
                        if (row["eps"], row["min_samples"])
                        == (best["eps"], best["min_samples"])
                        else 0
                    ),
                }
            )
    print(f"\nHasil lengkap disimpan ke: {args.out}")

    labels_path = args.out.replace(".csv", "_labels.csv")
    clusters, noise = _split_labels(best["labels"])
    with open(labels_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["x", "y", "label", "cluster_size"])
        sizes = {lbl: len(idx) for lbl, idx in clusters.items()}
        for (x, y), label in zip(points, best["labels"]):
            writer.writerow([x, y, label, sizes.get(str(label), 0)])
    print(f"Label kombinasi optimal disimpan ke: {labels_path}  (-1 = noise)")


if __name__ == "__main__":
    main()
