# Klasifikasi Gambar Ecoguard (Training + Evaluasi)

Pipeline training model klasifikasi multi-label berbasis **EfficientNet-B0**, export ke **ONNX**, serta **evaluasi model** (Confusion Matrix, Accuracy, Precision, Recall, F1-Score).

> **🚀 Training di Windows + NVIDIA GPU?** Lihat **[TRAINING_WINDOWS.md](./TRAINING_WINDOWS.md)** — panduan CUDA lengkap (instal torch CUDA, verifikasi GPU, train cepat).

## Alur

```
Download dataset → Taruh di collections/ → split.py (clean + resize 512×512 + split 80/10/10) → training → ONNX export → evaluasi (confusion matrix + metrics) → inference API
```

## Daftar Dataset

| Label | Sumber | Link |
|-------|--------|------|
| `fallen_tree` | new-dataset-3 (Kaggle) | [Link](https://www.kaggle.com/datasets/aryan57/new-dataset-3) |
| `garbage` | new-dataset-3 (Kaggle) | [Link](https://www.kaggle.com/datasets/aryan57/new-dataset-3) |
| `vandalism` | Urban Issues Dataset (Kaggle) | [Link](https://www.kaggle.com/datasets/akinduhiman/urban-issues-dataset) |
| `road_damage` | Road Damage Dataset (Kaggle) | [Link](https://www.kaggle.com/datasets/lorenzoarcioni/road-damage-dataset-potholes-cracks-and-manholes) |
| `flood` | Flood Images Mask Segmentation (Kaggle) | [Link](https://www.kaggle.com/datasets/saiharshitjami/flood-images-mask-segmentation) |

> **Data gak ikut git** — folder `datasets/`, `collections/`, dan `output/` sudah di `.gitignore`.

## Step-by-Step

### 1. Setup Environment

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

### 2. Siapkan Collections

Buat folder `collections/`, isi per label:

```
training/
├── collections/
│   ├── fallen_tree/
│   │   ├── foto1.jpg
│   │   └── ...
│   ├── garbage/
│   │   ├── ...
│   ├── vandalism/
│   ├── road_damage/
│   └── flood/
├── split.py
├── train.py
├── app.py
└── ...
```

Taruh semua gambar mentah di folder label yang sesuai. Nama file bebas.

### 3. Image Cleaning + Split

```bash
python split.py
```

Satu perintah ini bakal:

| Step | Aksi |
|------|------|
| 🧹 Hapus `datasets/` lama | Start bersih, gak tercampur |
| 📥 Baca dari `collections/` | Ambil semua gambar per label |
| ✏️ Rename | Urut per label: `1.jpg`, `2.jpg`, ... |
| 📐 Resize | **512×512**, aspect ratio preserved + padding hitam |
| 🔄 Konversi | Semua format dipaksa jadi `.jpg` |
| 🔀 Split | **80% train**, **10% val**, **10% test** |

Hasil:

```
datasets/
├── train/
│   ├── fallen_tree/
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   └── ...
│   ├── garbage/
│   ├── vandalism/
│   ├── road_damage/
│   └── flood/
├── val/
│   └── (sama, 10%)
└── test/
    └── (sama, 10%)
```

### 4. Training

```bash
python train.py --data datasets
```

Hasil:
- `output/model.onnx` — model siap deploy
- `output/labels.json` — daftar label urut

Opsi tambahan:

| Argumen | Default | Fungsi |
|---------|---------|--------|
| `--epochs` | 50 | Jumlah epoch |
| `--batch` | 32 | Batch size |
| `--lr` | 0.001 | Learning rate |

### 5. Inference (Optional)

```bash
python app.py               # Flask server di :5000
curl -X POST -F "image=@test.jpg" http://localhost:5000/predict
```

Balikin JSON: `{"prediction": "garbage", "confidence": 0.97}`

### 6. Evaluasi Model (Confusion Matrix + Metrics)

Setelah training, evaluasi model terhadap **test set**:

```bash
python evaluate.py --data datasets/test --model output/model.onnx --labels output/labels.json
```

Output:
- Confusion matrix (cetak + `output/confusion_matrix.csv`)
- Accuracy, Precision, Recall, F1-Score (macro)
- `output/evaluation_metrics.json` (untuk laporan TA)

### 7. Self-check Evaluasi

```bash
python check_evaluate.py   # uji fungsi metrik tanpa model (data sintetis)
```

## Spesifikasi

| Item | Detail |
|------|--------|
| Model | EfficientNet-B0 → ONNX |
| Input | RGB 224×224 (resize dari 512×512 via transform) |
| Framework | PyTorch → ONNX |
| VRAM | ~4-6 GB (GTX 1660 Super) |
| Inference | ONNX Runtime (CPU/GPU) |

## Catatan

- `datasets/`, `collections/`, `output/`, dan `venv/` di `.gitignore` — aman dari push.
- Training pake GPU otomatis kalo ada, fallback ke CPU.
- Validation set **wajib** — test cuma sekali setelah model final.
- Dataset baru? Taruh di `collections/label_baru/`, jalanin `split.py` lagi.
- Waktu training, kasih `--data datasets` karena default train.py masih `dataset`.
