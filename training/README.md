# Training — Klasifikasi Gambar Ecoguard

Pipeline training model klasifikasi multi-label berbasis **EfficientNet-B0**, export ke **ONNX** untuk deployment.

## Alur

```
Download dataset → Susun folder per label → split 80/10/10 → training → ONNX export → inference API
```

## Daftar Dataset

| Label | Sumber | Link |
|-------|--------|------|
| `fallen_tree` | new-dataset-3 (Kaggle) | [Link](https://www.kaggle.com/datasets/aryan57/new-dataset-3) |
| `garbage` | new-dataset-3 (Kaggle) | [Link](https://www.kaggle.com/datasets/aryan57/new-dataset-3) |
| `vandalism` | Urban Issues Dataset (Kaggle) | [Link](https://www.kaggle.com/datasets/akinduhiman/urban-issues-dataset) |
| `road_damage` | Road Damage Dataset (Kaggle) | [Link](https://www.kaggle.com/datasets/lorenzoarcioni/road-damage-dataset-potholes-cracks-and-manholes) |
| `flood` | Flood Images Mask Segmentation (Kaggle) | [Link](https://www.kaggle.com/datasets/saiharshitjami/flood-images-mask-segmentation) |

> **Dataset gak ikut git** — folder `dataset/` dan `output/` sudah di `.gitignore`.

## Step-by-Step

### 1. Setup Environment

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

### 2. Siapkan Dataset

Download dataset dari link di atas, lalu atur struktur folder `dataset/` seperti ini:

```
training/
├── dataset/
│   ├── fallen_tree/
│   │   ├── gambar1.jpg
│   │   └── ...
│   ├── garbage/
│   │   ├── gambar1.jpg
│   │   └── ...
│   ├── vandalism/
│   │   ├── gambar1.jpg
│   │   └── ...
│   ├── road_damage/
│   │   ├── gambar1.jpg
│   │   └── ...
│   └── flood/
│       ├── gambar1.jpg
│       └── ...
├── split.py
├── train.py
├── app.py
└── ...
```

**⚠️ Penting**: Pindahkan gambar dari tiap dataset ke folder label yang sesuai. Model bakal belajar dari nama folder sebagai label — pastikan nama foldernya cocok.

### 3. Split Dataset

```bash
python split.py
```

Membagi tiap kelas jadi:

| Split | Persentase | Fungsi |
|-------|-----------|--------|
| `dataset/train/` | 80% | Training — model belajar |
| `dataset/val/` | 10% | Validasi — pilih best model tiap epoch |
| `dataset/test/` | 10% | Testing — evaluasi final, sekali aja |

### 4. Training

```bash
python train.py
```

Hasil:
- `output/model.onnx` — model siap deploy
- `output/labels.json` — daftar label urut

**Opsi tambahan**:

| Argumen | Default | Fungsi |
|---------|---------|--------|
| `--epochs` | 50 | Jumlah epoch |
| `--batch` | 32 | Batch size (turunkin kalo VRAM penuh) |
| `--lr` | 0.001 | Learning rate |

### 5. Inference (Optional)

```bash
python app.py               # Flask server di :5000
curl -X POST -F "image=@test.jpg" http://localhost:5000/predict
```

Balikin JSON: `{"prediction": "garbage", "confidence": 0.97}`

## Spesifikasi

| Item | Detail |
|------|--------|
| Model | EfficientNet-B0 → ONNX |
| Input | RGB 224×224 |
| Framework | PyTorch → ONNX |
| VRAM | ~4-6 GB (GTX 1660 Super) |
| Inference | ONNX Runtime (CPU/GPU) |

## Catatan

- `dataset/`, `output/`, dan `venv/` di `.gitignore` — aman dari push.
- Training pake GPU otomatis kalo ada, fallback ke CPU kalo gak ada.
- Validation set **wajib** — test cuma boleh dipake **satu kali** setelah model final.
