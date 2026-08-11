# Klasifikasi (Training + Evaluasi)

Pipeline klasifikasi gambar EfficientNet-B0 → ONNX, plus evaluasi model (Confusion Matrix, Accuracy, Precision, Recall, F1-Score).

## Dataset

5 kategori dari Kaggle: fallen_tree, garbage, vandalism, road_damage, flood.

## Pipeline

```bash
cd research/classification
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python split.py    # clean + split 80/10/10
python train.py    # training → ONNX
python evaluate.py --data datasets/test  # evaluasi (confusion matrix + metrics)
```

Deploy:
```bash
cp output/model.onnx ../../backend/classification-service/models/
cp output/labels.json ../../backend/classification-service/models/
```
