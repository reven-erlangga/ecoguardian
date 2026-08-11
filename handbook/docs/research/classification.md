# Klasifikasi (Training + Evaluasi)

Pipeline klasifikasi gambar dengan **EfficientNet-B0**, export ke **ONNX**, serta **evaluasi model** menggunakan Confusion Matrix dan metrik Accuracy, Precision, Recall, F1-Score.

## Dataset

5 kategori dari Kaggle:

| Label | Dataset |
|-------|---------|
| `fallen_tree` | [new-dataset-3](https://www.kaggle.com/datasets/aryan57/new-dataset-3) |
| `garbage` | [new-dataset-3](https://www.kaggle.com/datasets/aryan57/new-dataset-3) |
| `vandalism` | [Urban Issues](https://www.kaggle.com/datasets/akinduhiman/urban-issues-dataset) |
| `road_damage` | [Road Damage](https://www.kaggle.com/datasets/lorenzoarcioni/road-damage-dataset-potholes-cracks-and-manholes) |
| `flood` | [Flood Images](https://www.kaggle.com/datasets/saiharshitjami/flood-images-mask-segmentation) |

Dataset di `research/classification/collections/` (gitignored).

## Pipeline

```bash
cd research/classification
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 1. Clean + split 80/10/10
python split.py

# 2. Training → ONNX export
python train.py

# 3. Evaluasi model (Confusion Matrix + metrics)
python evaluate.py --data datasets/test --model output/model.onnx --labels output/labels.json
```

### split.py
- Baca dari `collections/`
- Resize 512×512, konversi .jpg
- Rename urut (1.jpg, 2.jpg...)
- Split 80/10/10 ke `datasets/train|val|test/`

### train.py
- EfficientNet-B0 pretrained (ImageNet)
- Freeze backbone, train classifier head
- Augmentasi: flip, rotation, color jitter
- Best model tiap epoch → ONNX export

### evaluate.py
- Prediksi semua gambar di `datasets/test/`
- Hitung Confusion Matrix + Accuracy, Precision, Recall, F1-Score (macro)
- Output: `output/confusion_matrix.csv`, `output/evaluation_metrics.json`

## ONNX Export

Output ke `output/model.onnx` + `output/labels.json`.

Deploy ke classification service:
```bash
cp output/model.onnx ../../backend/classification-service/models/
cp output/labels.json ../../backend/classification-service/models/
```

## Testing

```bash
python app.py
curl -X POST -F "image=@test.jpg" http://localhost:5000/predict
```
