# Training Model di Windows (NVIDIA GPU)

Panduan training model klasifikasi EfficientNet-B0 → ONNX menggunakan **NVIDIA GPU** di **Windows**. Memanfaatkan CUDA untuk mempercepat training (jauh lebih cepat dari CPU/MPS).

> **Catatan:** Tutorial ini untuk Windows + NVIDIA. Untuk macOS/Apple Silicon, lihat `README.md` (jalankan di CPU/MPS).

---

## 1. Prasyarat Hardware/Software

- Windows 10/11 64-bit.
- **GPU NVIDIA** dengan driver terbaru (GeForce Game Ready / Studio Driver).
- **Python 3.10–3.12** (jangan 3.13+ — torch belum support stabil).
- `pip` terbaru.

---

## 2. Setup Environment

### A. Install Python

1. Download Python 3.11 dari [python.org](https://www.python.org/downloads/).
2. Saat install, **centang "Add Python to PATH"**.

### B. Buat Virtual Environment

Buka **Command Prompt** atau **PowerShell** di folder `research/classification`:

```bat
python -m venv venv
venv\Scripts\activate
```

### C. Install CUDA-enabled PyTorch

Install **PyTorch dengan CUDA** (bukan versi CPU). Dari [pytorch.org](https://pytorch.org/get-started/locally/), pilih:
- PyTorch Build: **Stable**
- OS: **Windows**
- Package: **Pip**
- Language: **Python**
- Compute Platform: **CUDA 12.x** (sesuai driver)

Contoh perintah (sesuaikan versi CUDA dengan driver kamu):

```bat
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

> **Cek driver CUDA:** jalankan `nvidia-smi` di CMD. Perhatikan versi CUDA di kanan atas (mis. `CUDA Version: 12.4`). Gunakan indeks `cu121`/`cu124` yang ≤ versi itu.

### D. Install Dependensi Lain

```bat
pip install -r requirements.txt
```

---

## 3. Verifikasi GPU Terdeteksi

```bat
python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

Harus output:
```
CUDA: True
GPU: NVIDIA GeForce RTX ...
```

Jika `CUDA: False`, berarti torch CUDA salah install (cek Langkah 2C).

---

## 4. Menyiapkan Dataset

Taruh dataset di `collections/` (folder per label):

```
research/classification/collections/
├── fallen_tree/     ← gambar .jpg/.png
├── garbage/
├── vandalism/
├── road_damage/
└── flood/
```

Lalu split 80/10/10:

```bat
python split.py
```

Hasil: `datasets/train|val|test/` (4000/500/500 untuk 5×1000 gambar).

---

## 5. Training (GPU)

```bat
python train.py --epochs 50 --batch 64
```

Parameter:
| Argumen | Default | Keterangan |
|---------|---------|------------|
| `--epochs` | 50 | Jumlah epoch |
| `--batch` | 32 | Batch size (GPU bisa lebih besar, mis. 64/128) |
| `--lr` | 0.001 | Learning rate |
| `--data` | `datasets` | Folder dataset |
| `--model-out` | `output/model.onnx` | Output model |
| `--labels-out` | `output/labels.json` | Output labels |

> **GPU vs CPU:** dengan CUDA, training 50 epoch pada 5000 gambar bisa selesai dalam **beberapa menit** (vs berjam-jam di CPU). GPU otomatis terdeteksi oleh `train.py`.

Hasil:
- `output/model.onnx` — model final.
- `output/labels.json` — daftar 5 label.

---

## 6. Evaluasi Model (Confusion Matrix + Metrik)

Setelah training, evaluasi terhadap test set:

```bat
python evaluate.py --data datasets/test --model output/model.onnx --labels output/labels.json
```

Output:
- Confusion matrix (cetak + `output/confusion_matrix.csv`).
- Accuracy, Precision, Recall, F1-Score (macro).
- `output/evaluation_metrics.json`.

Untuk visualisasi confusion matrix (gambar):

```bat
python -m pip install matplotlib
python -c "import json, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt; import numpy as np; d=json.load(open('output/evaluation_metrics.json')); l=d['labels']; cm=np.array(d['cm']); fig,ax=plt.subplots(figsize=(7,6)); ax.imshow(cm,cmap='Blues'); ax.set_xticks(range(len(l))); ax.set_xticklabels(l,rotation=45,ha='right'); ax.set_yticks(range(len(l))); ax.set_yticklabels(l); [ax.text(j,i,cm[i,j],ha='center',va='center') for i in range(len(l)) for j in range(len(l))]; ax.set_xlabel('Prediksi'); ax.set_ylabel('Aktual'); plt.tight_layout(); plt.savefig('output/confusion_matrix.png',dpi=150)"
```

---

## 7. Deploy ke Classification Service

Setelah model dilatih, salin ke service:

```bat
copy output\model.onnx ..\..\backend\classification-service\models\model.onnx
copy output\labels.json ..\..\backend\classification-service\models\labels.json
```

---

## 8. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `CUDA: False` | Torch salah versi. Install ulang dengan `--index-url .../cu121` sesuai `nvidia-smi`. |
| "No module named torch" | Jalankan `pip install torch torchvision --index-url ...` dulu. |
| Out of memory (OOM) | Turunkan `--batch` (64 → 32 → 16). |
| Python 3.13 tidak support torch | Gunakan Python 3.11/3.12. |
| ONNX export gagal | Bypass `torch.onnx` manual, atau naikkan `opset_version`. Model tetap tersimpan. |

---

## 9. Ringkasan Alur

```
collections/ (dataset)
  → split.py          → datasets/train|val|test/
  → train.py          → output/model.onnx + labels.json   (GPU)
  → evaluate.py       → confusion matrix + accuracy/precision/recall/f1
  → deploy             → backend/classification-service/models/
```
