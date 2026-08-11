"""Grid search DBSCAN untuk dataset BNPB — hasil 10 kombinasi terbaik + rekomendasi.

Menghasilkan:
  - Tabel 10 kombinasi (eps, min_samples, n_clusters, n_noise, noise_pct, silhouette, score)
  - Rekomendasi parameter optimal (score tertinggi) + alasan singkat
  - Output juga disimpan ke CSV (hasil_gridsearch.csv) untuk laporan TA.

Contoh:
    python gridsearch_rekomendasi.py
    python gridsearch_rekomendasi.py --eps-min 15 --eps-max 100 --eps-steps 20 \
        --min-samples-min 2 --min-samples-max 8
"""

import argparse
import csv

import numpy as np

from optimize_from_file import load_points, haversine_distance_km


def grid_search(dist_km, eps_values, min_samples_values):
    """Grid search eps (km) x min_samples dengan matriks haversine.

    Kualitas dinilai dengan score = silhouette * coverage(non-noise).
    Return list hasil (sudah diurutkan score menurun).
    """
    from sklearn.cluster import DBSCAN
    from sklearn.metrics import silhouette_score

    results = []
    for eps_km in eps_values:
        for min_samples in min_samples_values:
            labels = DBSCAN(eps=eps_km, min_samples=min_samples, metric="precomputed").fit_predict(dist_km)
            mask = labels != -1
            n_noise = int((~mask).sum())
            n_clusters = len(np.unique(labels[mask]))
            if n_clusters < 2:
                silhouette, score = 0.0, -1.0
            else:
                sub = dist_km[np.ix_(mask, mask)]
                silhouette = float(silhouette_score(sub, labels[mask], metric="precomputed"))
                score = silhouette * float(mask.mean())
            results.append({
                "eps": float(eps_km),
                "min_samples": int(min_samples),
                "n_clusters": n_clusters,
                "n_noise": n_noise,
                "noise_pct": round(100.0 * n_noise / len(dist_km), 2),
                "silhouette": round(silhouette, 4),
                "score": round(score, 4),
            })
    results.sort(key=lambda r: r["score"], reverse=True)
    return results


def main():
    parser = argparse.ArgumentParser(description="Grid search DBSCAN + rekomendasi (dataset BNPB).")
    parser.add_argument("--file", default="dataset/kejadian-bencana-bnpb.csv")
    parser.add_argument("--eps-min", type=float, default=15.0)
    parser.add_argument("--eps-max", type=float, default=100.0)
    parser.add_argument("--eps-steps", type=int, default=15)
    parser.add_argument("--min-samples-min", type=int, default=2)
    parser.add_argument("--min-samples-max", type=int, default=8)
    parser.add_argument("--top", type=int, default=10)
    parser.add_argument("--out", default="hasil_gridsearch.csv")
    args = parser.parse_args()

    points = load_points(args.file)
    print(f"Dataset  : {args.file}  ({len(points)} titik)")
    print(f"Grid     : eps {args.eps_steps} nilai [{args.eps_min:.1f}, {args.eps_max:.1f}] km x "
          f"min_samples [{args.min_samples_min}, {args.min_samples_max}]\n")

    dist_km = haversine_distance_km(points)
    eps_values = np.linspace(args.eps_min, args.eps_max, args.eps_steps).tolist()
    min_samples_values = list(range(args.min_samples_min, args.min_samples_max + 1))
    results = grid_search(dist_km, eps_values, min_samples_values)

    # ── Tabel 10 kombinasi terbaik ──
    print("=" * 88)
    print(f"{'No':>3} | {'Epsilon(km)':>10} | {'MinPts':>6} | {'Klaster':>8} | "
          f"{'Noise':>6} | {'Noise%':>7} | {'Silhouette':>10} | {'Score':>7}")
    print("=" * 88)
    for i, r in enumerate(results[: args.top], 1):
        print(f"{i:3d} | {r['eps']:10.2f} | {r['min_samples']:6d} | {r['n_clusters']:8d} | "
              f"{r['n_noise']:6d} | {r['noise_pct']:6.2f}% | {r['silhouette']:10.4f} | {r['score']:7.4f}")

    # ── Rekomendasi ──
    best = results[0]
    print("\n" + "=" * 88)
    print("REKOMENDASI PARAMETER OPTIMAL (score tertinggi)")
    print("=" * 88)
    print(f"  Epsilon      : {best['eps']:.2f} km")
    print(f"  MinPts       : {best['min_samples']}")
    print(f"  Jml Klaster  : {best['n_clusters']}")
    print(f"  Noise        : {best['n_noise']} titik ({best['noise_pct']}%)")
    print(f"  Silhouette   : {best['silhouette']}")
    print(f"  Score        : {best['score']}  (= silhouette x coverage)")

    # Simpan CSV
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(results[0].keys()) + ["rank"])
        writer.writeheader()
        for i, r in enumerate(results, 1):
            writer.writerow({**r, "rank": i})
    print(f"\nSemua kombinasi ({len(results)}) disimpan ke: {args.out}")


if __name__ == "__main__":
    main()
