# Training — Klasifikasi Gambar Ecoguard

Pipeline training model klasifikasi sampah/pohon tumbang/vandalisme berbasis **EfficientNet-B0**, export ke **ONNX** untuk deployment.

## Alur

```
Dataset mentah → split 80/10/10 → training → ONNX export → inference API
```

## Step-by-Step

### 1. Siapkan Dataset

Buat folder `dataset/` dengan struktur per kelas:

```
dataset/
├── fallen_tree/
│   ├── img001.jpg
│   └── ...
├── garbage/
│   ├── img001.jpg
│   └── ...
└── vandalism/
    ├── img001.jpg
    └── ...
```

> **Dataset sudah include?** Isi sendiri — file gambar gak di-track git (folder `dataset/` sudah di `.gitignore`).

### 2. Setup Environment

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

### 3. Split Dataset (80/10/10)

```bash
python split.py
```

Membagi tiap kelas jadi `train/`, `val/`, `test/` di dalam `dataset/`.

### 4. Training

```bash
python train.py
```

- Transfer learning: **EfficientNet-B0** (pretrained ImageNet)
- Freeze backbone, train head classifier
- Output ke `output/model.onnx` + `output/labels.json`
- Opsional: `--epochs 50 --batch 32 --lr 0.001`

### 5. Inference (Optional)

```bash
python app.py               # Flask server di :5000
curl -X POST -F "image=@test.jpg" http://localhost:5000/predict
```

Atau kirim request dari service lain — endpoint `/predict` nerima file image, balikin `{"prediction": "garbage", "confidence": 0.97}`.

## Spesifikasi

| Item | Detail |
|------|--------|
| Model | EfficientNet-B0 → ONNX |
| Input | RGB 224×224 |
| Framework | PyTorch → ONNX |
| VRAM | ~4-6 GB (GTX 1660 Super) |
| Inference | ONNX Runtime (CPU/GPU) |

## Catatan

- `dataset/`, `output/`, dan `venv/` sudah di `.gitignore` — gak bakal ke-push.
- Kalau GPU gak ada, fallback ke CPU (lambat tapi jalan).
