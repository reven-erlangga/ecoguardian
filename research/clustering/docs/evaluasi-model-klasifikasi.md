# Evaluasi Model Klasifikasi (Confusion Matrix + Metrik)

## Kalimat Pembuka

Evaluasi model klasifikasi dilakukan untuk mengukur kemampuan EfficientNet dalam mengidentifikasi kategori citra laporan lingkungan. Performa model diukur menggunakan *Confusion Matrix* dengan metrik **Accuracy, Precision, Recall, dan F1-Score** untuk menilai hasil klasifikasi.

> **Catatan pengujian:** Model dilatih pada subset dataset (100 gambar per kategori untuk kecepatan) dengan 3 epoch, dan dievaluasi pada data uji terpisah. Hasil akurasi pada data latih mencapai 90,44%.

## Hasil Confusion Matrix

**Tabel 4.x — Confusion Matrix Hasil Klasifikasi**

| Aktual \ Prediksi | fallen_tree | flood | garbage | road_damage | vandalism |
|-------------------|-------------|-------|---------|-------------|-----------|
| **fallen_tree** | 84 | 0 | 4 | 1 | 2 |
| **flood** | 2 | 92 | 1 | 0 | 2 |
| **garbage** | 8 | 3 | 70 | 5 | 14 |
| **road_damage** | 2 | 0 | 0 | 95 | 0 |
| **vandalism** | 4 | 1 | 1 | 3 | 85 |

## Hasil Metrik Evaluasi

**Tabel 4.y — Metrik Evaluasi Model**

| Metrik | Nilai |
|--------|-------|
| **Accuracy** | 88,94% |
| **Precision** (macro) | 0,8916 |
| **Recall** (macro) | 0,8910 |
| **F1-Score** (macro) | 0,8873 |

## Interpretasi

Dari confusion matrix terlihat bahwa model mampu mengklasifikasikan citra dengan baik. Kategori **flood** dan **road_damage** memiliki akurasi tertinggi (92 dan 95 dari 100), sedangkan **garbage** paling sering salah diklasifikasikan, terutama dikelirukan dengan vandalism (14 sampel) dan fallen_tree (8 sampel). Hal ini wajar karena kemiripan visual antara tumpukan sampah dengan area vandalisme maupun pohon tumbang.

Nilai **Accuracy 88,94%** dengan **F1-Score 0,8873** menunjukkan model memiliki performa yang baik dalam mengidentifikasi kelima kategori isu lingkungan. Precision dan Recall yang hampir seimbang (0,89) mengindikasikan model tidak bias terhadap satu kategori tertentu.

## File Pendukung

- `research/classification/output/model.onnx` — model yang dievaluasi.
- `research/classification/output/confusion_matrix.csv` — data confusion matrix.
- `research/classification/output/evaluation_metrics.json` — metrik lengkap.
