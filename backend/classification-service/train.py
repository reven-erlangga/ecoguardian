"""
Training script: EfficientNet-B0 → ONNX
5 label: banjir, jalan_rusak, bangunan_rusak, kebakaran, longsor

Usage:
  source .venv-train/bin/activate
  python train.py --data /path/to/dataset --epochs 50
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, models, transforms

# ─── Config ───────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument(
    "--data",
    default="../dataset",
    help="Path ke folder dataset (berisi train/ val/ test/)",
)
parser.add_argument("--epochs", type=int, default=50)
parser.add_argument("--batch", type=int, default=32)
parser.add_argument("--lr", type=float, default=0.001)
parser.add_argument("--model", default="efficientnet_b0")
parser.add_argument("--output", default="models/model.onnx")
parser.add_argument("--labels", default="features/classifier/labels.json")
args = parser.parse_args()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔥 Device: {device}")
print(f"📂 Data: {args.data}")


# ─── Dataset ──────────────────────────────────────────────
train_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

val_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

train_ds = datasets.ImageFolder(
    os.path.join(args.data, "train"), transform=train_transform
)
val_ds = datasets.ImageFolder(os.path.join(args.data, "val"), transform=val_transform)

train_loader = DataLoader(train_ds, batch_size=args.batch, shuffle=True, num_workers=0)
val_loader = DataLoader(val_ds, batch_size=args.batch, shuffle=False, num_workers=0)

labels = [cls for cls, _ in sorted(train_ds.class_to_idx.items(), key=lambda x: x[1])]
print(f"🏷️  Labels ({len(labels)}): {labels}")

# Simpan labels.json
os.makedirs(os.path.dirname(args.labels), exist_ok=True)
with open(args.labels, "w") as f:
    json.dump(labels, f, indent=2)


# ─── Model ────────────────────────────────────────────────
print(f"🧠 Model: {args.model}")
weights = models.EfficientNet_B0_Weights.DEFAULT
model = models.efficientnet_b0(weights=weights)

# Freeze semua layer
for param in model.parameters():
    param.requires_grad = False

# Ganti classifier head — 5 kelas
num_ftrs = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(0.2),
    nn.Linear(num_ftrs, len(labels)),
)
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.classifier.parameters(), lr=args.lr)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3, factor=0.5)


# ─── Training ─────────────────────────────────────────────
best_acc = 0.0
for epoch in range(1, args.epochs + 1):
    model.train()
    running_loss = 0.0

    for inputs, targets in train_loader:
        inputs, targets = inputs.to(device), targets.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    # Validation
    model.eval()
    correct = total = 0
    with torch.no_grad():
        for inputs, targets in val_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            total += targets.size(0)
            correct += (preds == targets).sum().item()

    acc = 100 * correct / total
    avg_loss = running_loss / len(train_loader)
    scheduler.step(avg_loss)

    print(
        f"📅 Epoch {epoch:2d}/{args.epochs} | Loss: {avg_loss:.4f} | Acc: {acc:.2f}%",
        end="",
    )

    if acc > best_acc:
        best_acc = acc
        # Save best model
        best_model = model.state_dict()
        print(f" 🏆 Best!")
    else:
        print()

print(f"\n✅ Best accuracy: {best_acc:.2f}%")


# ─── Export ONNX ──────────────────────────────────────────
model.load_state_dict(best_model)
model.eval()

try:
    dummy = torch.randn(1, 3, 224, 224).to(device)
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    torch.onnx.export(
        model,
        dummy,
        args.output,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        opset_version=17,
    )
    print(f"✅ Model exported: {args.output}")
except Exception as e:
    print(f"⚠️  ONNX export gagal: {e}")
    # Fallback: save PyTorch checkpoint
    torch.save(best_model, "models/best_checkpoint.pth")
    print(f"✅ Checkpoint saved: models/best_checkpoint.pth")

print(f"✅ Labels: {args.labels}")
print(f"🎯 Done!")
