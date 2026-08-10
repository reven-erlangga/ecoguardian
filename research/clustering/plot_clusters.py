"""Visualisasi hasil clustering DBSCAN pada data geolokasi (peta klaster).

Menghasilkan dua gambar:
  1. Peta klaster  : scatter lat/lon, klaster terbesar diberi warna berbeda,
                     titik noise diberi penanda "x" merah. Opsional di-zoom
                     ke satu negara via --country.
  2. Plot k-distance: jarak ke tetangga ke-k terurut (dasar pemilihan eps).

Contoh penggunaan:
    python plot_clusters.py                                    # peta global
    python plot_clusters.py --eps 45.79 --min-samples 2        # parameter optimal
    python plot_clusters.py --country id                       # zoom ke Indonesia
    python plot_clusters.py --country jp --out peta_jepang.png
    python plot_clusters.py --country indonesia                # nama negara juga bisa

--country menerima kode ISO Alpha-2 ('id'), Alpha-3 ('idn'), atau nama
('indonesia') — case-insensitive. Butuh geopandas (latar batas negara).
"""

import argparse
import csv
import os
import tempfile
import urllib.request

import matplotlib

matplotlib.use("Agg")  # backend tanpa GUI (cocok untuk server/CI)
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.lines import Line2D
from sklearn.cluster import DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.neighbors import NearestNeighbors

from geocode import cluster_names
from optimize_from_file import EARTH_RADIUS_KM, haversine_distance_km, load_points

# Natural Earth 110m admin-0 (resmi, punya kolom ISO_A2); diunduh sekali ke /tmp.
WORLD_GEOJSON_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
    "master/geojson/ne_110m_admin_0_countries.geojson"
)
WORLD_CACHE = os.path.join(tempfile.gettempdir(), "ne_110m_admin_0_countries.geojson")


def load_world_geodataframe():
    """Muat batas negara (Natural Earth) — None bila gagal / geopandas tidak ada."""
    try:
        import geopandas as gpd
    except ImportError:
        return None
    try:
        if not os.path.exists(WORLD_CACHE):
            print("(mengunduh batas negara Natural Earth ...)")
            urllib.request.urlretrieve(WORLD_GEOJSON_URL, WORLD_CACHE)
        return gpd.read_file(WORLD_CACHE)
    except Exception as exc:
        print(f"(gagal memuat batas negara: {exc}; lanjut tanpa peta dasar)")
        return None


def find_country(world, code):
    """Cari geometri negara dari kode/ nama (Alpha-2, Alpha-3, atau nama).

    Return (geometry, nama_resmi) atau (None, None) bila tidak ditemukan.
    """
    if world is None:
        return None, None
    key = str(code).strip().lower()
    if not key:
        return None, None

    # Kolom kandidat untuk pencocokan: kode ISO maupun nama.
    name_col = next((c for c in ("NAME", "ADMIN", "name", "admin")
                     if c in world.columns), None)
    for col in ("ISO_A2", "ISO_A3", "iso_a2", "iso_a3", "id", "ADM0_A3"):
        if col in world.columns:
            m = world[world[col].astype(str).str.lower() == key]
            if len(m):
                geom = _union(m.geometry)
                label = (
                    str(m.iloc[0][name_col])
                    if name_col is not None else key.upper()
                )
                return geom, label
    if name_col is not None:
        m = world[world[name_col].astype(str).str.lower() == key]
        if len(m):
            return _union(m.geometry), str(m.iloc[0][name_col])
    return None, None


def _union(geometry_series):
    """Gabungkan geometri (kompatibel geopandas lama & baru)."""
    try:
        return geometry_series.union_all()
    except AttributeError:
        return geometry_series.unary_union


def points_in_country(points, geom):
    """Boolean mask: titik lat/lon (derajat) yang berada di dalam wilayah negara."""
    from shapely.geometry import Point

    return np.array(
        [geom.contains(Point(lon, lat)) for lat, lon in points]
    )


def estimate_eps_default(points, metric, k=2):
    """Estimasi eps tunggal: median k-distance positif (heuristik default)."""
    if metric == "haversine":
        rad = np.radians(points)
        nn = NearestNeighbors(n_neighbors=k, metric="haversine").fit(rad)
        distances, _ = nn.kneighbors(rad)
        vals = distances[:, -1] * EARTH_RADIUS_KM
    else:
        nn = NearestNeighbors(n_neighbors=k).fit(points)
        distances, _ = nn.kneighbors(points)
        vals = distances[:, -1]
    positive = vals[vals > 0]
    return float(np.percentile(positive, 50))


def plot_cluster_map(points, labels, top_k, out_path, dpi, meta, country=None,
                     pad=1.5, geocode=False, geocode_zoom=10):
    mask = labels != -1
    fig, ax = plt.subplots(figsize=(14, 8))
    world = load_world_geodataframe()

    country_geom, country_name = None, None
    if country:
        country_geom, country_name = find_country(world, country)
        if country_geom is None:
            print(f"(peringatan: negara '{country}' tidak ditemukan; lanjut peta global)")

    if world is not None:
        world.boundary.plot(ax=ax, linewidth=0.4, edgecolor="#5b6b7a")
        if country_geom is not None:
            gpd_geo = __import__("geopandas").GeoSeries([country_geom])
            gpd_geo.boundary.plot(ax=ax, linewidth=1.6, edgecolor="#111111")

    # Filter titik bila zoom negara aktif.
    if country_geom is not None:
        inside = points_in_country(points, country_geom)
        n_inside = int(inside.sum())
        print(f"Negara   : {country_name} ({n_inside} titik di dalam wilayah)")
        pts, lbl = points[inside], labels[inside]
        if n_inside == 0:
            print("(peringatan: tidak ada titik di dalam wilayah negara ini)")
    else:
        pts, lbl = points, labels

    mask = lbl != -1
    cluster_ids = np.unique(lbl[mask])
    sizes = {int(cid): int((lbl == cid).sum()) for cid in cluster_ids}
    top_ids = sorted(sizes, key=sizes.get, reverse=True)[:top_k]

    # Titik klaster di luar top-K -> abu-abu kecil.
    other = mask & ~np.isin(lbl, top_ids)
    ax.scatter(
        pts[other, 1], pts[other, 0],
        s=10, c="#9aa5b1", alpha=0.5, linewidths=0, label="Klaster lain",
    )

    # Top-K klaster terbesar -> warna berbeda.
    cmap = plt.cm.tab10
    legend_handles = []
    place_names = {}
    if geocode:
        print("(mengambil nama daerah dari OpenStreetMap Nominatim ...)")
        place_names = cluster_names(pts, lbl, top_ids, zoom=geocode_zoom)
    for i, cid in enumerate(top_ids):
        sel = lbl == cid
        color = cmap(i % 10)
        ax.scatter(
            pts[sel, 1], pts[sel, 0],
            s=16, c=[color], alpha=0.85, linewidths=0,
        )
        centroid = pts[sel].mean(axis=0)
        name = place_names.get(cid)
        label_text = name if name else f"#{cid}"
        ax.annotate(
            label_text, (centroid[1], centroid[0]),
            textcoords="offset points", xytext=(5, 5), fontsize=8, color=color,
        )
        if name:
            print(f"  klaster #{cid} ({sizes[cid]} titik) -> {name}")
        legend_handles.append(
            Line2D([0], [0], marker="o", color="w", markerfacecolor=color,
                   markersize=7,
                   label=f"{name or f'Klaster #{cid}'} ({sizes[cid]} titik)")
        )
    if geocode:
        stem = os.path.splitext(out_path)[0]
        csv_path = stem + "_clusters.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["cluster_id", "place_name", "n_points",
                             "centroid_lat", "centroid_lon"])
            for cid in sorted(sizes, key=sizes.get, reverse=True):
                sel = lbl == cid
                centroid = pts[sel].mean(axis=0)
                writer.writerow([cid, place_names.get(cid, ""), sizes[cid],
                                 round(float(centroid[0]), 6),
                                 round(float(centroid[1]), 6)])
        print(f"Rincian klaster disimpan ke: {csv_path}")

    # Noise -> tanda x merah.
    ax.scatter(
        pts[~mask, 1], pts[~mask, 0],
        s=14, c="#d62728", marker="x", alpha=0.7, linewidths=0.6, label="Noise",
    )

    # Proporsi sumbu agar bentuk peta tidak terdistorsi.
    mid_lat = float(np.median(pts[:, 0]))
    if np.isfinite(mid_lat) and abs(mid_lat) < 89:
        ax.set_aspect(1.0 / np.cos(np.radians(mid_lat)))

    # Zoom ke wilayah negara.
    if country_geom is not None:
        minx, miny, maxx, maxy = country_geom.bounds
        ax.set_xlim(minx - pad, maxx + pad)
        ax.set_ylim(miny - pad, maxy + pad)

    scope = f" — {country_name}" if country_name else ""
    n_clusters_vis = len(np.unique(lbl[mask]))
    n_noise_vis = int((~mask).sum())
    noise_pct_vis = 100.0 * n_noise_vis / len(pts) if len(pts) else 0.0
    ax.set_xlabel("Bujur (Longitude)")
    ax.set_ylabel("Lintang (Latitude)")
    ax.set_title(
        f"{meta['title']}{scope}\n"
        f"eps = {meta['eps']:.2f} {meta['unit']} | MinPts = {meta['min_samples']} | "
        f"klaster terlihat = {n_clusters_vis} | noise = {n_noise_vis} ({noise_pct_vis:.1f}%) | "
        f"silhouette = {meta['silhouette']:.3f}",
        fontsize=11,
    )
    ax.grid(alpha=0.25, linestyle="--")

    handles = [Line2D([0], [0], marker="o", color="w", markerfacecolor="#9aa5b1",
                      markersize=6, label="Klaster lain")] + legend_handles
    handles.append(Line2D([0], [0], marker="x", color="w", markerfacecolor="#d62728",
                          markeredgecolor="#d62728", markersize=7, label="Noise"))
    ax.legend(handles=handles, loc="lower left", fontsize=8, framealpha=0.9)

    fig.tight_layout()
    fig.savefig(out_path, dpi=dpi, bbox_inches="tight")
    plt.close(fig)
    print(f"Peta klaster disimpan ke: {out_path}")


def plot_kdistance(points, metric, k, eps, unit, out_path, dpi):
    """Plot k-distance terurut + garis eps (justifikasi pemilihan eps)."""
    if metric == "haversine":
        rad = np.radians(points)
        nn = NearestNeighbors(n_neighbors=k, metric="haversine").fit(rad)
        distances, _ = nn.kneighbors(rad)
        k_dist = np.sort(distances[:, -1]) * EARTH_RADIUS_KM
    else:
        nn = NearestNeighbors(n_neighbors=k).fit(points)
        distances, _ = nn.kneighbors(points)
        k_dist = np.sort(distances[:, -1])

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(k_dist, linewidth=1.2, color="#2c6fbb")
    ax.axhline(eps, color="#d62728", linestyle="--", linewidth=1.2,
               label=f"eps = {eps:.2f} {unit}")
    ax.set_xlabel("Titik (diurutkan berdasarkan k-distance)")
    ax.set_ylabel(f"Jarak ke tetangga ke-{k} ({unit})")
    ax.set_title(f"Plot k-distance (k={k}) — dasar estimasi Epsilon")
    ax.legend()
    ax.grid(alpha=0.25, linestyle="--")
    fig.tight_layout()
    fig.savefig(out_path, dpi=dpi, bbox_inches="tight")
    plt.close(fig)
    print(f"Plot k-distance disimpan ke: {out_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Visualisasi peta klaster hasil DBSCAN pada data geolokasi."
    )
    parser.add_argument("--file", default="dataset/flood.csv",
                        help="file dataset (.csv / .json)")
    parser.add_argument("--x-col", help="kolom koordinat X (nama/index; default: auto-detect Latitude)")
    parser.add_argument("--y-col", help="kolom koordinat Y (nama/index; default: auto-detect Longitude)")
    parser.add_argument("--metric", choices=["euclidean", "haversine"], default="haversine")
    parser.add_argument("--eps", type=float, help="Epsilon (km utk haversine, derajat utk euclidean); default: estimasi median k-distance")
    parser.add_argument("--min-samples", type=int, default=2, help="MinPts (default: 2)")
    parser.add_argument("--k", type=int, default=2, help="k utk k-distance (default: 2)")
    parser.add_argument("--top-k", type=int, default=8, help="jumlah klaster terbesar yg diwarnai (default: 8)")
    parser.add_argument("--country", help="zoom ke negara: kode ISO Alpha-2 ('id'), Alpha-3 ('idn'), atau nama ('indonesia')")
    parser.add_argument("--pad", type=float, default=1.5, help="padding derajat di sekitar wilayah negara (default: 1.5)")
    parser.add_argument("--geocode", action="store_true", help="beri nama klaster dari OpenStreetMap (Nominatim reverse; ~1 detik/klaster)")
    parser.add_argument("--geocode-zoom", type=int, default=14, help="level zoom Nominatim (default: 14 = level kecamatan/kelurahan; lebih besar = lebih spesifik)")
    parser.add_argument("--out", default="cluster_map.png", help="file output peta klaster")
    parser.add_argument("--kdist-out", default="kdistance_plot.png", help="file output plot k-distance")
    parser.add_argument("--dpi", type=int, default=200)
    args = parser.parse_args()

    points = load_points(args.file, x_col=args.x_col, y_col=args.y_col)
    print(f"Dataset  : {args.file}  ({len(points)} titik)")

    if args.metric == "haversine":
        unit = "km"
        print("(menghitung matriks jarak haversine ...)")
        dist = haversine_distance_km(points)
        eps = args.eps if args.eps is not None else estimate_eps_default(points, "haversine", args.k)
        print(f"eps = {eps:.2f} km")
        labels = DBSCAN(eps=eps, min_samples=args.min_samples, metric="precomputed").fit_predict(dist)
        mask = labels != -1
        if len(np.unique(labels[mask])) >= 2:
            sil = float(silhouette_score(dist[np.ix_(mask, mask)], labels[mask], metric="precomputed"))
        else:
            sil = float("nan")
    else:
        unit = "derajat"
        eps = args.eps if args.eps is not None else estimate_eps_default(points, "euclidean", args.k)
        print(f"eps = {eps:.4f} derajat")
        labels = DBSCAN(eps=eps, min_samples=args.min_samples).fit_predict(points)
        mask = labels != -1
        if len(np.unique(labels[mask])) >= 2:
            sil = float(silhouette_score(points[mask], labels[mask]))
        else:
            sil = float("nan")

    n_noise = int((~mask).sum())
    n_clusters = len(np.unique(labels[mask]))
    meta = {
        "title": "Klaster Spasial Laporan (DBSCAN)",
        "eps": eps, "unit": unit, "min_samples": args.min_samples,
        "n_clusters": n_clusters, "n_noise": n_noise,
        "noise_pct": 100.0 * n_noise / len(points), "silhouette": sil,
    }
    print(f"Hasil: {n_clusters} klaster, {n_noise} noise ({meta['noise_pct']:.1f}%), "
          f"silhouette = {sil:.4f}")

    plot_cluster_map(points, labels, args.top_k, args.out, args.dpi, meta,
                     country=args.country, pad=args.pad,
                     geocode=args.geocode, geocode_zoom=args.geocode_zoom)
    plot_kdistance(points, args.metric, args.k, eps, unit, args.kdist_out, args.dpi)


if __name__ == "__main__":
    main()
