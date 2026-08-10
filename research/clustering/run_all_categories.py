"""Optimasi & visualisasi DBSCAN per kategori — 1 file CSV = 1 kategori.

Struktur dataset yang diharapkan:
    dataset/
      flood.csv
      vandalism.csv
      traffic.csv
      ...

Nama file (tanpa ekstensi) dipakai sebagai nama kategori. Tiap file harus
memiliki kolom Latitude & Longitude (auto-detect) — kolom lain diabaikan.
Untuk setiap kategori, script menjalankan grid search Epsilon x MinPts
(metodologi identik: k-distance -> grid search -> silhouette x coverage),
lalu mencetak tabel perbandingan antar kategori.

Contoh penggunaan:
    python run_all_categories.py --dir dataset/categories
    python run_all_categories.py --dir dataset/categories --maps --country id
    python run_all_categories.py --dir dataset/categories --metric euclidean
    python run_all_categories.py --dir dataset/categories --out hasil.csv --maps
"""

import argparse
import csv
import glob
import os

import numpy as np
from sklearn.cluster import DBSCAN

from optimize_from_file import (
    estimate_eps_range,
    estimate_eps_range_km,
    grid_search_dbscan,
    grid_search_haversine,
    haversine_distance_km,
    load_points,
)
from plot_clusters import plot_cluster_map


def main():
    parser = argparse.ArgumentParser(
        description="Optimasi DBSCAN per kategori (1 file CSV = 1 kategori)."
    )
    parser.add_argument("--dir", default="dataset",
                        help="folder berisi file CSV per kategori (default: dataset)")
    parser.add_argument("--pattern", default="*.csv", help="pola file (default: *.csv)")
    parser.add_argument("--x-col", help="kolom koordinat X (default: auto-detect Latitude)")
    parser.add_argument("--y-col", help="kolom koordinat Y (default: auto-detect Longitude)")
    parser.add_argument("--metric", choices=["euclidean", "haversine"], default="haversine")
    parser.add_argument("--eps-steps", type=int, default=20, help="jumlah nilai eps (default: 20)")
    parser.add_argument("--min-samples-min", type=int, default=2)
    parser.add_argument("--min-samples-max", type=int, default=10)
    parser.add_argument("--k", type=int, default=2, help="k utk estimasi k-distance (default: 2)")
    parser.add_argument("--maps", action="store_true", help="buat peta klaster per kategori")
    parser.add_argument("--maps-dir", default="peta", help="folder output peta (default: peta)")
    parser.add_argument("--country", help="zoom peta ke negara (ISO Alpha-2/3 atau nama)")
    parser.add_argument("--pad", type=float, default=1.5, help="padding zoom (derajat)")
    parser.add_argument("--geocode", action="store_true", help="beri nama klaster dari OpenStreetMap (Nominatim reverse)")
    parser.add_argument("--geocode-zoom", type=int, default=10, help="level zoom Nominatim (default: 10)")
    parser.add_argument("--top-k", type=int, default=8, help="jumlah klaster terbesar diwarnai di peta")
    parser.add_argument("--dpi", type=int, default=200)
    parser.add_argument("--out", default="hasil_kategori.csv", help="file CSV ringkasan")
    args = parser.parse_args()

    files = sorted(glob.glob(os.path.join(args.dir, args.pattern)))
    # Jangan proses file output ringkasan (bisa berada di folder yang sama).
    out_name = os.path.basename(args.out)
    files = [f for f in files if os.path.basename(f) != out_name]
    if not files:
        raise SystemExit(f"tidak ada file '{args.pattern}' di {args.dir}")

    print(f"Folder    : {args.dir}  ({len(files)} file kategori ditemukan)")
    print(f"Metrik    : {args.metric}")

    summary = []
    for path in files:
        name = os.path.splitext(os.path.basename(path))[0]
        print(f"\n{'=' * 64}\nKATEGORI: {name}  ({path})")

        try:
            points = load_points(path, x_col=args.x_col, y_col=args.y_col)
        except SystemExit as exc:
            print(f"(skip {name}: {exc})")
            continue
        n = len(points)
        if n < 3:
            print(f"(skip: hanya {n} titik, minimal 3 utk clustering)")
            continue

        min_samples_values = list(range(args.min_samples_min, args.min_samples_max + 1))

        if args.metric == "haversine":
            unit = "km"
            dist = haversine_distance_km(points)
            est_min, est_max = estimate_eps_range_km(points, k=args.k)
            print(f"(estimasi eps k-distance: {est_min:.1f}-{est_max:.1f} km)")
            eps_values = np.linspace(est_min, est_max, args.eps_steps).tolist()
            results, best = grid_search_haversine(dist, eps_values, min_samples_values)
        else:
            unit = "derajat"
            est_min, est_max = estimate_eps_range(points, k=args.k)
            print(f"(estimasi eps k-distance: {est_min:.4f}-{est_max:.4f} derajat)")
            eps_values = np.linspace(est_min, est_max, args.eps_steps).tolist()
            results, best = grid_search_dbscan(
                points, eps_values, min_samples_values, metric="euclidean"
            )

        noise_pct = 100.0 * best["n_noise"] / n
        row = {
            "category": name,
            "n_points": n,
            "eps": round(best["eps"], 6),
            "eps_unit": unit,
            "min_samples": best["min_samples"],
            "n_clusters": best["n_clusters"],
            "n_noise": best["n_noise"],
            "noise_pct": round(noise_pct, 2),
            "silhouette": round(best["silhouette"], 6),
            "score": round(best["score"], 6),
            "est_eps_min": round(est_min, 6),
            "est_eps_max": round(est_max, 6),
        }
        summary.append(row)
        print(f"  optimal : eps={best['eps']:.2f} {unit}, MinPts={best['min_samples']} | "
              f"klaster={best['n_clusters']} | noise={best['n_noise']} ({noise_pct:.1f}%) | "
              f"silhouette={best['silhouette']:.4f}")

        if args.maps:
            meta = {
                "title": f"Klaster Spasial — {name}",
                "eps": best["eps"],
                "unit": unit,
                "min_samples": best["min_samples"],
                "n_clusters": best["n_clusters"],
                "n_noise": best["n_noise"],
                "noise_pct": noise_pct,
                "silhouette": best["silhouette"],
            }
            os.makedirs(args.maps_dir, exist_ok=True)
            out = os.path.join(args.maps_dir, f"peta_{name}.png")
            plot_cluster_map(
                points, np.array(best["labels"]), args.top_k, out, args.dpi,
                meta, country=args.country, pad=args.pad,
                geocode=args.geocode, geocode_zoom=args.geocode_zoom,
            )

    # ---- Tabel ringkasan perbandingan antar kategori ----
    print("\n" + "=" * 92)
    print("RINGKASAN OPTIMASI PER KATEGORI")
    print("-" * 92)
    print(f"{'kategori':<14}{'titik':>7}{'eps':>10} {'unit':<9}{'minPts':>7}"
          f"{'klaster':>9}{'noise':>7}{'noise%':>8}{'silhouette':>11}")
    print("-" * 94)
    for r in summary:
        print(f"{r['category']:<14}{r['n_points']:>7}{r['eps']:>10.2f} {r['eps_unit']:<9}"
              f"{r['min_samples']:>7}{r['n_clusters']:>9}{r['n_noise']:>7}"
              f"{r['noise_pct']:>7.1f}%{r['silhouette']:>11.4f}")

    if args.out and summary:
        with open(args.out, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(summary[0].keys()))
            writer.writeheader()
            writer.writerows(summary)
        print(f"\nRingkasan disimpan ke: {args.out}")


if __name__ == "__main__":
    main()
