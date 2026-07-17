"""
Quick test untuk Classification Service.
Generate dummy gambar, kirim via gRPC, lihat hasil.
"""

import io

import numpy as np
from PIL import Image

# Generate random dummy image (224x224 RGB)
img = Image.fromarray(
    np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8),
    "RGB",
)
buf = io.BytesIO()
img.save(buf, format="JPEG")
image_bytes = buf.getvalue()

# ─── Test lewat gRPC (proto belum generate, kita panggil mock) ───
import sys

sys.path.insert(0, ".")
from features.classifier import ClassificationService, ONNXInferenceEngine

engine = ONNXInferenceEngine(
    model_path="models/model.onnx",
    labels_path="features/classifier/labels.json",
)
svc = ClassificationService(engine)

result = svc.classify(image_bytes, "jpeg")

print("📸 Classification Result:")
print(f"   Label      : {result['label']}")
print(f"   Confidence : {result['confidence']:.4f}")
print(f"   Candidates :")
for c in result["candidates"]:
    print(f"     - {c['label']}: {c['confidence']:.4f}")
