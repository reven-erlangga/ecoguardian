# research/clustering

Riset clustering spasial **DBSCAN** (scikit-learn) untuk pemetaan laporan
lingkungan — optimasi parameter Epsilon & MinPts, identifikasi noise, dan
visualisasi peta klaster dengan penamaan daerah via OpenStreetMap.

Dokumentasi lengkap: `handbook/docs/research/clustering.md`.

## Setup

```bash
cd research/clustering
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Server jalan di `http://localhost:5000`.

## API

### `POST /cluster`

Body JSON:

```json
{
  "points": [[1.0, 2.0], [1.1, 2.0], [8.0, 8.0], [50.0, 50.0]],
  "eps": 0.5,
  "min_samples": 2
}
```

`points` bisa berupa `[[x, y], ...]` atau `[{"x": ..., "y": ...}, ...]`.
`eps` wajib; `min_samples` (default `5`) dan `metric` (default `euclidean`) opsional.

Contoh:

```bash
curl -X POST http://localhost:5000/cluster \
  -H "Content-Type: application/json" \
  -d '{"points": [[0,0],[0.1,0],[10,10],[50,50]], "eps": 1, "min_samples": 2}'
```

Respons:

```json
{
  "labels": [0, 0, 1, -1],
  "clusters": {"0": [0, 1], "1": [2]},
  "noise": [3],
  "n_clusters": 2,
  "n_points": 4,
  "n_noise": 1,
  "params": {"eps": 1.0, "min_samples": 2, "metric": "euclidean"}
}
```

### `POST /optimize` — optimasi parameter DBSCAN

Grid search kombinasi **Epsilon (eps)** dan **MinPts (min_samples)** untuk
menemukan parameter paling optimal dalam membentuk klaster sekaligus
mengidentifikasi data **noise**. Kualitas tiap kombinasi dinilai dengan
skor `silhouette * coverage` (coverage = proporsi titik non-noise), sehingga
kombinasi optimal harus kompak/terpisah baik dan seminimal mungkin membuang
titik sebagai noise.

Body JSON — eps bisa berupa daftar eksplisit **atau** rentang; begitu juga MinPts:

```json
{
  "points": [[1.0, 2.0], [1.1, 2.0], [8.0, 8.0], [50.0, 50.0]],
  "eps_values": [0.5, 1.0, 1.5],
  "min_samples_values": [2, 3, 5]
}
```

atau dengan rentang:

```json
{
  "points": [[1.0, 2.0], [1.1, 2.0], [8.0, 8.0], [50.0, 50.0]],
  "eps_min": 0.1, "eps_max": 2.0, "eps_steps": 20,
  "min_samples_min": 2, "min_samples_max": 10
}
```

Contoh:

```bash
curl -X POST http://localhost:5000/optimize \
  -H "Content-Type: application/json" \
  -d '{"points": [[0,0],[0.1,0],[10,10],[50,50]], "eps_values": [0.5,1,1.5], "min_samples_values": [2,3]}'
```

Respons:

```json
{
  "best": {"eps": 1.0, "min_samples": 2, "n_clusters": 2, "n_noise": 1,
           "silhouette": 0.9, "score": 0.675, "params": {}},
  "labels": [0, 0, 1, -1],
  "clusters": {"0": [0, 1], "1": [2]},
  "noise": [3],
  "n_clusters": 2, "n_noise": 1, "n_points": 4, "grid_size": 6,
  "results": [{"eps": 1.0, "min_samples": 2, "n_clusters": 2,
                 "n_noise": 1, "silhouette": 0.9, "score": 0.675}, ...]
}
```

`results` berisi **semua** kombinasi yang dicoba, diurutkan dari skor terbaik
ke terburuk — berguna untuk melihat trade-off antar kombinasi.

### `GET /health`

```json
{"status": "ok"}
```

## Optimasi dari file dataset

Untuk dataset yang disimpan dalam file, jalankan script `optimize_from_file.py`
(tanpa perlu server berjalan):

```bash
python optimize_from_file.py --file data.csv
python optimize_from_file.py --file data.json --eps-min 0.1 --eps-max 2.0 \
  --eps-steps 20 --min-samples-min 2 --min-samples-max 8 --top 10
```

- `.csv`  : kolom `Latitude`/`Longitude` dideteksi otomatis dari header;
  bisa diubah dengan `--x-col`/`--y-col` (nama kolom atau index, mis.
  `--x-col Latitude --y-col Longitude`). Tanpa header, dua kolom pertama
  yang numerik yang dipakai.
- `.json` : list `[[x, y], ...]` atau `[{"x": ..., "y": ...}, ...]`.
- Jika `--eps-min`/`--eps-max` tidak diberikan, rentang eps diestimasi otomatis
  dengan metode **k-distance** (persentil 5%–95% dari jarak ke tetangga ke-`k`).
- `--metric haversine` menghitung jarak **geodesik** (permukaan bumi) sehingga
  eps dinyatakan dalam **kilometer** — lebih akurat untuk data lat/lon global:

  ```bash
  python optimize_from_file.py --file dataset/flood_dataset_classification.csv \
    --metric haversine --eps-min 5 --eps-max 160 --eps-steps 20
  ```

- Output: laporan parameter optimal + daftar index data noise di terminal,
  `results_optimize.csv` (semua kombinasi), dan `results_optimize_labels.csv`
  (label tiap titik, `-1` = noise).

## Visualisasi peta klaster

Script `plot_clusters.py` membuat gambar peta klaster (klaster terbesar
berwarna, noise penanda `x` merah, latar batas negara bila `geopandas`
terpasang) dan plot k-distance (dasar estimasi Epsilon):

```bash
python plot_clusters.py --eps 45.79 --min-samples 2 --top-k 8
python plot_clusters.py --metric euclidean --eps 0.4488   # eps dalam derajat
```

Zoom ke wilayah satu negara dengan `--country` (kode ISO Alpha-2, Alpha-3,
atau nama negara — case-insensitive):

```bash
python plot_clusters.py --country id            # Indonesia
python plot_clusters.py --country jp --out peta_jepang.png
python plot_clusters.py --country indonesia     # nama juga bisa
```

Titik di luar wilayah negara otomatis disaring, batas negara digaris tebal,
dan peta di-zoom dengan padding `--pad` (default 1.5°).

**Nama klaster dari OpenStreetMap** dengan `--geocode` — tiap klaster terbesar
diberi nama daerah yang mewakilinya (reverse geocoding Nominatim pada titik
medoid klaster):

```bash
python plot_clusters.py --country id --geocode --top-k 6
python run_all_categories.py --dir dataset --maps --geocode
```

Karena kebijakan Nominatim (maks 1 permintaan/detik), `--top-k` membatasi
jumlah klaster yang diberi nama. Default `--geocode-zoom 14` menghasilkan
nama level kecamatan/desa; kecilkan (mis. 10) untuk level kota/kabupaten.
Rincian klaster (id, nama, jumlah titik, centroid) disimpan ke `*_clusters.csv`.

**Parameter vs tingkat kekhususan nama:** nama makin spesifik bila klaster
makin lokal — perkecil `eps` (radius, mis. 0.7 km utk road-damage) untuk
klaster per kecamatan, atau besarkan `min_samples` untuk hanya mempertahankan
daerah berdensitas tinggi (perhatikan noise ikut naik).

Output: `cluster_map.png` dan `kdistance_plot.png` (resolusi tinggi, siap
untuk dokumen skripsi).

## Optimasi per kategori (1 file CSV = 1 kategori)

Jika dataset tersusun sebagai beberapa file CSV di satu folder dan **nama file
mewakili kategori** (`flood.csv`, `vandalism.csv`, ...), jalankan
`run_all_categories.py`. Script memproses semua file sekaligus: tiap kategori
dioptimasi parameternya sendiri (k-distance → grid search → silhouette),
mencetak tabel perbandingan antar kategori, dan opsional membuat peta tiap
kategori:

```bash
python run_all_categories.py --dir dataset
python run_all_categories.py --dir dataset --maps --country id   # + peta zoom Indonesia
python run_all_categories.py --dir dataset --out hasil.csv       # ringkasan ke CSV
```

Catatan: file output ringkasan otomatis dikecualikan dari pemindaian; file
tanpa koordinat valid dilewati dengan peringatan.

## Test

```bash
pytest
```
