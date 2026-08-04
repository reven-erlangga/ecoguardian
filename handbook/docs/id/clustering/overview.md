# Clustering

Mengelompokkan laporan berdekatan agar petugas bisa handle beberapa laporan dalam satu perjalanan.

## Tujuan

```mermaid
flowchart LR
    A[Laporan A<br/>Jl. Merdeka No.1] --> C{Area sama?}
    B[Laporan B<br/>Jl. Merdeka No.5] --> C
    C -->|Ya, beda 300m| D[Satu petugas<br/>selesai dua laporan]
    E[Laporan C<br/>16 km jauh] -->|Tidak| F[Kirim petugas lain]
```

## Sumber Data

Data dari laporan Twitter yang masuk via Twitter Service. Tidak ada dataset awal — hasil berubah dinamis:

```
Twitter API → Twitter Service → MongoDB → Clustering
```
