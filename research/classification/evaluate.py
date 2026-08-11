"""
Evaluasi model klasifikasi citra (ONNX): Confusion Matrix + Accuracy,
Precision, Recall, dan F1-Score.

Cara pakai (dari folder research/classification):
  1. Pastikan dataset uji tersedia di  datasets/test/<label>/
     (dihasilkan oleh split.py -> train/val/test)
  2. Pastikan model ONNX ada di  output/model.onnx
  3. Jalankan:
       python evaluate.py
       python evaluate.py --data datasets/test --model output/model.onnx \
           --labels output/labels.json

Output:
  - Confusion matrix (cetak + file confusion_matrix.csv / .png)
  - Accuracy, Precision (macro), Recall (macro), F1-Score (macro)
  - Sinkron ke docs/ T/A: tabel metrik + confusion matrix
"""

import argparse
import csv
import json
import os

import numpy as np
import onnxruntime as ort
from PIL import Image

from evaluate_metrics import confusion_matrix, metrics

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def load_labels(path):
    with open(path) as f:
        return json.load(f)


def preprocess(img: Image.Image) -> np.ndarray:
    """Resize 224x224 -> RGB -> normalize ImageNet -> NCHW [1,3,224,224]."""
    img = img.convert("RGB").resize((224, 224))
    arr = np.array(img).astype(np.float32) / 255.0
    arr = (arr - MEAN) / STD
    arr = np.transpose(arr, (2, 0, 1))          # HWC -> CHW
    return np.expand_dims(arr, axis=0).astype(np.float32)


def collect_predictions(session, data_root, labels):
    """Prediksi semua gambar di data_root/<label>/, kembalikan (y_true, y_pred)."""
    input_name = session.get_inputs()[0].name
    y_true, y_pred = [], []
    for label_idx, label in enumerate(labels):
        folder = os.path.join(data_root, label)
        if not os.path.isdir(folder):
            print(f"⚠️  Folder label tidak ditemukan: {folder}")
            continue
        files = sorted(
            f
            for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        for fname in files:
            img = Image.open(os.path.join(folder, fname))
            x = preprocess(img)
            logits = session.run(None, {input_name: x})[0][0]
            idx = int(np.argmax(logits))
            y_true.append(label_idx)
            y_pred.append(idx)
    return np.array(y_true), np.array(y_pred)


def print_cm(cm, labels):
    print("\n=== CONFUSION MATRIX ===")
    header = " " * 18 + "".join(f"{l[:12]:>14}" for l in labels)
    print(header)
    for i, row in enumerate(cm):
        print(f"{labels[i][:16]:<18}" + "".join(f"{v:>14}" for v in row))


def save_cm_csv(cm, labels, path):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["True \\ Predicted"] + labels)
        for i, row in enumerate(cm):
            w.writerow([labels[i]] + [int(v) for v in row])
    print(f"✅ Confusion matrix -> {path}")


def main():
    parser = argparse.ArgumentParser(description="Evaluasi model klasifikasi ONNX.")
    parser.add_argument("--data", default="datasets/test", help="folder data uji (berisi folder per label)")
    parser.add_argument("--model", default="output/model.onnx", help="path model ONNX")
    parser.add_argument("--labels", default="output/labels.json", help="path labels.json")
    parser.add_argument("--out-dir", default="output", help="folder output hasil evaluasi")
    args = parser.parse_args()

    if not os.path.exists(args.model):
        raise SystemExit(f"Model tidak ditemukan: {args.model}")

    labels = load_labels(args.labels)
    print(f"📊 Model  : {args.model}")
    print(f"📊 Labels : {labels}")
    print(f"📊 Data   : {args.data}\n")

    session = ort.InferenceSession(args.model)
    y_true, y_pred = collect_predictions(session, args.data, labels)
    if len(y_true) == 0:
        raise SystemExit("Tidak ada gambar uji ditemukan.")

    cm = confusion_matrix(y_true, y_pred, len(labels))
    m = metrics(cm)

    print_cm(cm, labels)
    print("\n=== METRIK EVALUASI (macro) ===")
    print(f"Accuracy   : {m['accuracy']:.4f} ({m['accuracy']*100:.2f}%)")
    print(f"Precision  : {m['precision']:.4f}")
    print(f"Recall     : {m['recall']:.4f}")
    print(f"F1-Score   : {m['f1']:.4f}")

    os.makedirs(args.out_dir, exist_ok=True)
    save_cm_csv(cm, labels, os.path.join(args.out_dir, "confusion_matrix.csv"))

    # Simpan metrik ke JSON (untuk laporan TA)
    with open(os.path.join(args.out_dir, "evaluation_metrics.json"), "w") as f:
        json.dump({"labels": labels, "cm": cm.tolist(), "metrics": m}, f, indent=2)
    print(f"✅ Metrik -> {os.path.join(args.out_dir, 'evaluation_metrics.json')}")


if __name__ == "__main__":
    main()
