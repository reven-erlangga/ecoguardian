# 4.2.3 Analisis Kinerja Sistem

## Kalimat Pembuka

Pengujian performa dilakukan menggunakan metode *load testing* dengan alat k6 untuk menilai kemampuan sistem dalam menangani permintaan secara bersamaan. Pengujian berfokus pada pengukuran waktu respons (*response time*) dan tingkat kegagalan permintaan (*error rate*), dengan memberikan variasi jumlah pengguna virtual (VU) untuk mengevaluasi stabilitas sistem terhadap peningkatan beban. Hasil pengujian ditampilkan pada Tabel 4.6.

## Hasil Pengujian

Pengujian dilakukan terhadap endpoint GraphQL gateway dengan skenario 10 pengguna virtual (VU) selama 2 menit (ramp-up 10 → steady 10 → ramp-down).

**Tabel 4.6 — Hasil Pengujian Kinerja Sistem (k6)**

| Metrik | Nilai | Threshold |
|--------|-------|-----------|
| Waktu respons rata-rata | 16,26 ms | — |
| Waktu respons p(95) | 24,02 ms | < 2000 ms |
| Total request | 904 | — |
| Error rate | 0% | < 1% |
| Throughput | 7,52 req/s | — |

## Interpretasi

Hasil pengujian menunjukkan waktu respons rata-rata sebesar 16,26 ms dengan persentil ke-95 sebesar 24,02 ms, yang berada jauh di bawah ambang batas 2000 ms. Seluruh 904 permintaan berhasil diproses tanpa error (0%), sehingga dapat disimpulkan bahwa sistem mampu menangani beban akses dengan kinerja yang baik dan stabil.

## Kesimpulan Parsial

Sistem gateway mampu melayani permintaan secara bersamaan dengan waktu respons yang cepat dan tanpa kegagalan, sehingga kinerja sistem dinilai memadai untuk menangani beban pengguna pada penggunaan normal.
