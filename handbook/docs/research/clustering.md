# Clustering (Riset)

Riset **pemetaan spasial laporan lingkungan menggunakan DBSCAN**: mencari
kombinasi parameter **Epsilon (eps)** dan **MinPts (min_samples)** yang optimal
dalam membentuk klaster serta mengidentifikasi data yang termasuk **noise**.
Hasil klaster divisualisasikan sebagai peta dan diberi nama daerah (kecamatan/
desa) via **OpenStreetMap Nominatim**.

Kode: `research/clustering/`

## Struktur

```
research/clustering/
├── app.py                   # Flask API: /cluster, /optimize, /health
├── optimize_from_file.py    # CLI grid search dari file dataset
├── plot_clusters.py         # CLI peta klaster + plot k-distance
├── run_all_categories.py    # CLI optimasi per kategori (1 file = 1 kategori)
├── geocode.py               # Reverse geocoding Nominatim (penamaan klaster)
├── dataset/
│   ├── flood.csv            # 6.237 laporan banjir (global)
│   └── road-damage.csv      # 2.500 laporan kerusakan jalan (Cirebon)
├── peta/                    # Output peta (PNG) + rincian klaster (CSV)
├── sample_data.csv          # Dataset sintetis untuk demo cepat
└── tests/                   # pytest endpoint API
```

## Setup

```bash
cd research/clustering
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Dependensi: `flask`, `numpy`, `scikit-learn`, `pytest`, `matplotlib`, dan
opsional `geopandas` (latar batas negara pada peta).

## Metodologi

1. **Estimasi rentang Epsilon** dengan metode *k-distance* (persentil 5%–95%
   dari jarak ke tetangga ke-*k*; koordinat duplikat dengan jarak 0 diabaikan).
2. **Grid search** kombinasi eps × MinPts (mis. 20 nilai eps × 9 MinPts = 180
   kombinasi). Untuk data lat/lon, jarak dihitung dengan **haversine**
   (eps dalam km) agar sesuai permukaan bumi.
3. **Skor kualitas** = *silhouette × coverage non-noise*. Silhouette
   dievaluasi pada titik non-noise (klaster < 2 → skor −1); coverage =
   proporsi titik yang tidak dibuang sebagai noise. Skor menyeimbangkan
   kepadatan-&-separasi klaster dengan minimasi titik noise.
4. **Identifikasi noise**: titik berlabel `-1` (di luar radius eps dari semua
   inti klaster) dilaporkan sebagai index + persentase.
5. **Penamaan klaster**: medoid tiap klaster terbesar di-reverse-geocode ke
   Nominatim → nama daerah.

---

## Konsep Parameter: Epsilon & MinPts

DBSCAN hanya punya **dua parameter utama** — memahami keduanya adalah kunci
membaca seluruh hasil di bawah.

### Epsilon (eps) — jari-jari "lingkaran pertemanan"

- **Definisi**: jarak maksimum agar dua titik dianggap *bertetangga*. DBSCAN
gambar lingkaran radius `eps` di sekitar tiap titik; titik lain di dalam
lingkaran itu adalah tetangganya.
- **Satuan**: mengikuti unit data — **km** (metrik haversine) atau **derajat**
(metrik euclidean). Satu derajat lintang ≈ 111 km.
- **Kecil** → lingkaran sempit → hanya titik yang sangat dekat yang berteman →
klaster kecil-kecil, banyak titik menyendiri (noise).
- **Besar** → lingkaran lebar → klaster makin besar, noise berkurang, tapi
klaster berbeda bisa ikut menyatu (over-merge).
- **Cara memilih**: plot *k-distance* (lihat panduan membaca di bawah) —
radius di sekitar "lutut" kurva adalah kandidat eps yang baik.

**Analogi**: seberapa dekat dua laporan agar dianggap "satu area". eps 1 km =
report dalam radius 1 km dianggap satu area; eps 45 km = laporan sekabupaten
bisa menyatu.

### MinPts (min_samples) — jumlah minimal tetangga agar jadi "inti"

- **Definisi**: jumlah tetangga (termasuk dirinya sendiri) di dalam radius
`eps` agar sebuah titik disebut **core point** (inti klaster).
- **Core point**: tetangga ≥ MinPts dalam radius eps → menjadi biji klaster.
- **Border point**: bukan inti, tetapi berada dalam jangkauan inti → ikut
menjadi anggota klaster.
- **Noise**: bukan inti dan tidak terjangkau inti mana pun → label `-1`.
- **Kecil (2)** → gampang jadi inti → klaster mudah terbentuk, noise sedikit.
- **Besar (mis. 10)** → butuh kepadatan tinggi → hanya area ramai yang jadi
klaster; area jarang dibuang sebagai noise.
- **Aturan umum**: `dimensi + 1` s.d. `2 × dimensi` (untuk 2D: 3–5), tetapi
untuk data geolokasi yang sparse, MinPts kecil (2) sering lebih cocok.

**Analogi**: berapa laporan minimal di suatu area agar area itu layak disebut
"titik rawan". MinPts 10 = minimal 10 laporan dalam radius eps baru dianggap
area rawan; di bawah itu dianggap laporan terpencil (noise).

### Interaksi eps × MinPts

Keduanya bekerja bersama — kepadatan minimum yang disyaratkan adalah
`MinPts` dibagi volume lingkaran `eps`. Karena itu pengujian dilakukan
sebagai **grid search**: kombinasi berbagai nilai eps dan MinPts diuji, dan
yang terbaik dipilih berdasarkan skor (lihat di bawah).

| | eps kecil | eps besar |
|---|---|---|
| **MinPts kecil** | klaster kecil & rapat, noise sedang | klaster besar, noise sedikit |
| **MinPts besar** | klaster sangat lokal, noise tinggi | hanya area sangat padat yang jadi klaster |

Perhatikan dari tabel hasil 5.5: **eps adalah lever kekhususan spasial**
(eps 1,04→0,63 km menambah klaster 25→51), sedangkan **MinPts adalah lever
kepadatan minimum** (menaikkannya tidak memecah klaster, hanya membuang titik
kepadatan rendah sebagai noise).

---

## Panduan Membaca Hasil

### Kolom pada tabel grid search

| Kolom | Arti | Cara membacanya |
|-------|------|-----------------|
| `eps` | Epsilon yang diuji | satuan km/derajat sesuai metrik |
| `min_samples` | MinPts yang diuji | jumlah minimal tetangga |
| `n_clusters` | Jumlah klaster terbentuk | makin banyak = makin terlokalisasi |
| `n_noise` | Jumlah titik noise | makin besar = makin banyak laporan terisolasi |
| `silhouette` | Kualitas pemisahan klaster (titik non-noise) | makin mendekati 1 = makin baik |
| `score` | `silhouette × coverage` — skor akhir | dipakai untuk memilih parameter optimal |

### Silhouette Score

Silhouette mengukur **kohesi** (kedekatan titik dalam satu klaster) dan
**separasi** (jarak ke klaster lain) sekaligus. Rentang −1 s.d. 1, dibaca:

| Nilai | Kategori | Contoh pada riset ini |
|-------|----------|----------------------|
| 0,71 – 1,00 | **Struktur kuat** | flood 0,793 |
| 0,51 – 0,70 | Struktur wajar | — |
| 0,26 – 0,50 | Struktur lemah | road-damage 0,442 |
| ≤ 0,25 | Tidak ada struktur | — |

> Silhouette dihitung **hanya pada titik non-noise** — nilai tinggi sebagian
> karena titik noise dibuang lebih dulu. Selalu laporkan bersamaan dengan
> persentase noise.

Contoh pembacaan satu baris (flood, parameter optimal):

```
eps=45.57 km  min_samples=2  n_clusters=1052  n_noise=1612 (25.9%)  silhouette=0.7931  score=0.588
```

Artinya: dengan radius 45,57 km dan minimal 2 laporan per area, **74,1% laporan
tergabung ke 1.052 area**, 25,9% terisolasi (noise), dan area yang terbentuk
terpisah dengan baik (silhouette 0,793 = struktur kuat).

### Trade-off yang wajib dipahami

Pada tabel hasil 5.1 terlihat pola konsisten: **eps kecil → silhouette tinggi
+ noise tinggi** (13,16 km: silhouette 0,958 tapi 46% noise); **eps besar →
noise turun tapi silhouette melemah**. Parameter optimal dipilih di titik
tengah lewat skor `silhouette × coverage` — bukan silhouette tertinggi.

### Membaca plot k-distance

Plot ini adalah dasar pemilihan eps (metode lutut/knee):

- **Sumbu X**: tiap titik, diurutkan dari k-distance terkecil ke terbesar.
- **Sumbu Y**: jarak titik tersebut ke tetangga ke-*k* (mis. k=2).
- Titik yang termasuk klaster punya k-distance kecil (bagian datar di kiri);
titik noise/terpencil punya k-distance besar (ekor curam di kanan).
- **"Lutut" kurva** (titik belok) menandai batas kepadatan — eps ideal
berada di sekitar lutut; garis merah horizontal menunjukkan eps yang dipilih.

### Membaca peta klaster

- **Warna berbeda** → klaster terbesar (lihat legenda: nama daerah + jumlah
titik).
- **`x` merah** → titik noise (label −1).
- **Abu-abu** → klaster lain di luar top-K.
- **Label nama daerah** → hasil reverse geocoding medoid klaster
(`--geocode`); zoom 10 = kota/kabupaten, zoom 14 = kecamatan/desa.
- Judul peta memuat parameter + ringkasan (klaster, noise, silhouette).

### Membaca file CSV keluaran

- `hasil_kategori.csv` — satu baris per kategori: bandingkan `eps`, `minPts`,
`n_clusters`, `n_noise`, `silhouette` antar kategori (parameter yang berbeda
per kategori = bukti clustering harus dipisah per kategori).
- `*_clusters.csv` — rincian klaster per kategori: `cluster_id`,
`place_name` (daerah), `n_points` (jumlah laporan), `centroid_lat/lon` —
siap dijadikan tabel lampiran skripsi.
- `results_optimize_labels.csv` — label tiap titik (`-1` = noise) untuk
pemeriksaan titik-titik noise spesifik.

---

## 1. Flask API (`app.py`)

```bash
python app.py          # http://localhost:5000
```

### `POST /cluster` — DBSCAN sekali jalan

```bash
curl -X POST http://localhost:5000/cluster -H "Content-Type: application/json" \
  -d '{"points": [[0,0],[0.1,0],[10,10],[50,50]], "eps": 1, "min_samples": 2}'
```

```json
{
  "labels": [0, 0, 1, -1],
  "clusters": {"0": [0, 1], "1": [2]},
  "noise": [3],
  "n_clusters": 2, "n_noise": 1, "n_points": 4,
  "params": {"eps": 1.0, "min_samples": 2, "metric": "euclidean"}
}
```

`points` bisa `[[x,y],...]` atau `[{"x":..,"y":..},...]`; `min_samples`
(default 5) dan `metric` (default `euclidean`) opsional.

### `POST /optimize` — grid search eps × MinPts

```bash
curl -X POST http://localhost:5000/optimize -H "Content-Type: application/json" \
  -d '{"points": [[0,0],[0.1,0],[10,10],[50,50]], "eps_values": [0.5,1,1.5], "min_samples_values": [2,3]}'
```

Bisa juga pakai rentang: `eps_min`, `eps_max`, `eps_steps` dan/atau
`min_samples_min`, `min_samples_max`. Respons:

```json
{
  "best": {"eps": 1.0, "min_samples": 2, "n_clusters": 2, "n_noise": 1,
           "silhouette": 0.9, "score": 0.675, "params": {}},
  "labels": [0, 0, 1, -1],
  "clusters": {"0": [0, 1], "1": [2]},
  "noise": [3],
  "n_clusters": 2, "n_noise": 1, "n_points": 4, "grid_size": 6,
  "results": [{"eps": 1.0, "min_samples": 2, "n_clusters": 2, "n_noise": 1,
                "silhouette": 0.9, "score": 0.675}, ...]
}
```

`results` berisi **semua** kombinasi terurut skor terbaik → terburuk.

### `GET /health`

```json
{"status": "ok"}
```

---

## 2. Grid search dari file (`optimize_from_file.py`)

```bash
# Auto-detect kolom Latitude/Longitude dari header
python optimize_from_file.py --file dataset/flood.csv

# Haversine (eps dalam km), rentang eksplisit
python optimize_from_file.py --file dataset/road-damage.csv --metric haversine \
  --eps-min 5 --eps-max 160 --eps-steps 20 --top 10

# Kolom custom
python optimize_from_file.py --file data.csv --x-col Latitude --y-col Longitude
```

Fitur: k-distance auto-estimasi eps (bila `--eps-min/max` tidak diberikan),
`.csv` (2 kolom pertama / auto-detect lat-lon) atau `.json`, keluaran laporan
parameter optimal + index noise, `results_optimize.csv` (semua kombinasi) dan
`results_optimize_labels.csv` (label tiap titik, `-1` = noise).

---

## 3. Peta klaster (`plot_clusters.py`)

```bash
# Peta global (eps dalam km utk haversine)
python plot_clusters.py --file dataset/flood.csv --eps 45.57 --min-samples 2

# Zoom ke Indonesia + nama daerah dari OpenStreetMap (zoom 14 = kecamatan/desa)
python plot_clusters.py --file dataset/road-damage.csv --eps 0.71 --min-samples 5 \
  --country id --geocode --top-k 6

# Nama negara juga bisa: --country indonesia / --country idn
```

Output: `cluster_map.png` + `kdistance_plot.png` (dasar estimasi eps). Dengan
`--geocode`, nama daerah tampil di label & legenda peta, dan rincian klaster
disimpan ke `*_clusters.csv` (id, place_name, n_points, centroid).

> **Rate limit Nominatim**: maks 1 permintaan/detik — script menunggu 1,1 detik
> per klaster, jadi jaga `--top-k` (6–10) wajar. `--geocode-zoom` default 14.

---

## 4. Per kategori (`run_all_categories.py`)

Struktur dataset: **1 file CSV = 1 kategori**, nama file = nama kategori
(`flood.csv`, `road-damage.csv`, ...).

```bash
python run_all_categories.py --dir dataset
python run_all_categories.py --dir dataset --maps --country id --geocode
python run_all_categories.py --dir dataset --out hasil_kategori.csv
```

Memproses semua file sekaligus, mencetak tabel perbandingan parameter optimal
antar kategori, menyimpan `hasil_kategori.csv`, dan (dengan `--maps`) peta per
kategori. File output ringkasan otomatis dikecualikan; file tanpa koordinat
valid dilewati dengan peringatan.

---

## Hasil Pengujian

### 5.1 Flood (6.237 titik, global) — grid search haversine

**Parameter optimal: eps = 45,57 km, MinPts = 2** → 1.052 klaster, 1.612 noise
(25,9%), silhouette **0,793** (struktur kuat). Sepuluh kombinasi terbaik:

| eps (km) | MinPts | Klaster | Noise | Silhouette | Skor |
|----------|--------|---------|-------|-----------|------|
| 45,79 | 2 | 1.052 | 1.611 | 0,793 | 0,588 |
| 37,63 | 2 | 1.050 | 1.895 | 0,839 | 0,584 |
| 53,95 | 2 | 1.012 | 1.395 | 0,744 | 0,578 |
| 29,47 | 2 | 1.031 | 2.218 | 0,892 | 0,575 |
| 62,11 | 2 | 961 | 1.185 | 0,686 | 0,556 |
| 21,32 | 2 | 977 | 2.553 | 0,933 | 0,551 |
| 70,26 | 2 | 893 | 1.042 | 0,642 | 0,535 |
| 13,16 | 2 | 884 | 2.900 | 0,958 | 0,513 |
| 78,42 | 2 | 826 | 909 | 0,599 | 0,512 |
| 86,58 | 2 | 779 | 796 | 0,569 | 0,497 |

Terlihat *trade-off*: eps kecil → silhouette tinggi tapi noise naik (13,16 km →
2.900 noise, 46%); eps besar → noise turun tapi pemisahan klaster melemah.

### 5.2 Road-damage (2.500 titik, Cirebon) — grid search haversine

**Parameter optimal: eps = 1,04 km, MinPts = 10** → 25 klaster, 794 noise
(31,8%), silhouette **0,442** (struktur lemah — wajar karena seluruh titik
menumpuk di satu wilayah sehingga klaster saling tumpang tindih).

### 5.3 Perbandingan antar kategori

| Kategori | Titik | eps optimal | MinPts | Klaster | Noise | Noise % | Silhouette |
|----------|-------|-------------|--------|---------|-------|---------|-----------|
| flood | 6.237 | 45,57 km | 2 | 1.052 | 1.612 | 25,9% | 0,793 |
| road-damage | 2.500 | 1,04 km | 10 | 25 | 794 | 31,8% | 0,442 |

**Temuan kunci**: tiap kategori butuh parameter sangat berbeda — flood tersebar
global (eps besar, MinPts kecil), road-damage padat lokal (eps kecil, MinPts
besar). Inilah alasan clustering dilakukan **per kategori**, bukan digabung.

### 5.4 Euclidean vs Haversine (flood)

| Metrik | eps optimal | Klaster | Noise | Silhouette | Skor |
|--------|-------------|---------|-------|-----------|------|
| Euclidean | 0,4488° ≈ 49,8 km | 1.050 | 1.607 (25,8%) | 0,784 | 0,582 |
| Haversine | 45,79 km ≈ 0,41° | 1.052 | 1.611 (25,8%) | 0,793 | 0,588 |

Keduanya memilih radius ~46–50 km dengan hasil nyaris identik (data global
sparse), tapi haversine sedikit lebih baik karena menghitung jarak sebenarnya
di permukaan bumi (euclidean mendistorsi 1° bujur vs 1° lintang).

### 5.5 Kekhususan spasial (eps vs MinPts)

MinPts 10→40 tidak memecah klaster road-damage (tetap ~25, noise naik) —
pembeda spasial sebenarnya adalah **eps**:

| eps (km) | MinPts | Klaster | Noise | Silhouette |
|----------|--------|---------|-------|-----------|
| 1,04 | 10 | 25 | 794 (31,8%) | 0,442 |
| 0,80 | 9 | 35 | 1.019 (40,8%) | 0,476 |
| 0,71 | 5 | 37 | 857 (34,3%) | 0,398 |
| 0,63 | 6 | 51 | 1.076 (43,0%) | 0,414 |

Radius lebih kecil → klaster lebih terlokalisasi (nama daerah lebih spesifik)
dengan konsekuensi proporsi noise meningkat — bahan diskusi skripsi.

### 5.6 Penamaan klaster (Nominatim reverse geocoding)

**Zoom 10 (kota/kabupaten) vs Zoom 14 (kecamatan/desa):**

| Konteks | Zoom 10 | Zoom 14 |
|---------|---------|---------|
| Cirebon (titik uji) | Kabupaten Cirebon | **Bodesari** |
| Road-damage klaster #1 | Kabupaten Cirebon (379) | **Plumbon** (314) |
| Road-damage klaster #21 | Brebes (86) | **Tegalgubug Lor** (80) |
| Flood klaster #33 | Jakarta Selatan (30) | **Cilandak Barat** (30) |
| Flood klaster #157 | Majalengka (29) | **Werasari** (29) |
| Flood klaster #329 | Madiun (6) | **Jerukgulung** (6) |

Road-damage spesifik (eps 0,71 km, zoom 14): **Plumbon** (314), **Lemahabang
Kulon** (152), **Tegalgubug Lor** (80), **Kedungbunder** (70), **Babakan** (61),
**Kertawinangun** (55). Flood spesifik (zoom 14): **Cilandak Barat** (30),
**Werasari** (29), **Kledung** (10), **Tangse** (7), **Jerukgulung** (6),
**Batu Basa** (5).

---

## Catatan & Troubleshooting

- **Silhouette dihitung pada titik non-noise** — nilai tinggi sebagian karena
  titik noise dibuang; tuliskan ini secara transparan di skripsi.
- **Nominatim**: butuh koneksi internet; jika gagal, nama fallback ke `#id`.
  Jangan melebihi 1 request/detik (`--top-k` kecil).
- **Geopandas**: opsional untuk latar batas negara; tanpa itu peta tetap dibuat.
- **Koordinat duplikat** menghasilkan k-distance 0 — estimasi eps otomatis
  mengabaikannya; bila semua duplikat, tentukan `--eps-min/max` manual.
- **Test**: `pytest` di `research/clustering` (13 test).
