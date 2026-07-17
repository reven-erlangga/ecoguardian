"""Export model terakhir ke ONNX (tanpa training ulang)"""

import json
import os

import torch
import torch.nn as nn
from torchvision import models

labels_path = "features/classifier/labels.json"
output_path = "models/model.onnx"

# Load labels
with open(labels_path) as f:
    labels = json.load(f)

# Rebuild model
model = models.efficientnet_b0(weights=None)
num_ftrs = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(0.2),
    nn.Linear(num_ftrs, len(labels)),
)

# Cari checkpoint terakhir
checkpoint = "models/best_checkpoint.pth"
if not os.path.exists(checkpoint):
    print("No checkpoint found. Jalanin training dulu.")
    exit(1)

model.load_state_dict(torch.load(checkpoint, map_location="cpu"))
model.eval()

# Export ONNX
dummy = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model,
    dummy,
    output_path,
    input_names=["input"],
    output_names=["output"],
    opset_version=17,
)
print(f"✅ ONNX exported: {output_path}")
print(f"✅ Labels: {labels}")
