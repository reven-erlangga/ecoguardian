# Training

Training model klasifikasi gambar EfficientNet-B0 → ONNX.

## Dataset

5 kategori dari Kaggle: fallen_tree, garbage, vandalism, road_damage, flood.

## Pipeline

```bash
cd research/training
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python split.py    # clean + split 80/10/10
python train.py    # training → ONNX
```

Deploy:
```bash
cp output/model.onnx ../../backend/classification-service/models/
cp output/labels.json ../../backend/classification-service/models/
```
