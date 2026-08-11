# Research

Folder untuk penelitian skripsi.

```
research/
├── classification/     # Klasifikasi: training + evaluasi model
│   ├── collections/    # Dataset gambar (gitignored)
│   ├── split.py
│   ├── train.py
│   └── app.py
└── clustering/         # Riset DBSCAN: optimasi eps & MinPts, peta klaster
    ├── app.py                   # Flask API /cluster & /optimize
    ├── optimize_from_file.py    # Grid search dari file dataset
    ├── plot_clusters.py         # Peta klaster + k-distance + penamaan OSM
    ├── run_all_categories.py    # Optimasi per kategori (1 file = 1 kategori)
    ├── geocode.py               # Reverse geocoding Nominatim
    ├── dataset/                 # flood.csv, road-damage.csv
    └── peta/                    # Output peta PNG + CSV
```

Detail riset clustering: [Clustering (Riset)](./clustering).
