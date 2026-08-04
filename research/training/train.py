"""
Training: EfficientNet-B0 → ONNX
3 label: fallen_tree, garbage, vandalism
Optimized for 6GB VRAM (GTX 1660 Super)

Cara pakai (Windows PowerShell):
  1. Install Python 3.12+ (dari python.org — centang "Add to PATH")
  2. Buka folder ini di terminal
  3. python -m venv venv
  4. venv\\Scripts\\activate
  5. pip install -r requirements.txt
  6. python split.py  (bagi 80/10/10)
  7. python train.py  (training + export ONNX)
"""

import argparse
import json
import os
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data", default="datasets", help="Folder datasets (berisi train/ val/)"
    )
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch", type=int, default=32)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--model-out", default="output/model.onnx")
    parser.add_argument("--labels-out", default="output/labels.json")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🔥 Device: {device}")

    # ─── Transforms ────────────────────────────────────────
    mean, std = [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]

    train_tfm = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean, std),
        ]
    )
    val_tfm = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean, std),
        ]
    )

    # ─── Dataset ──────────────────────────────────────────
    train_ds = datasets.ImageFolder(os.path.join(args.data, "train"), train_tfm)
    val_ds = datasets.ImageFolder(os.path.join(args.data, "val"), val_tfm)

    train_loader = DataLoader(
        train_ds, args.batch, shuffle=True, num_workers=0, pin_memory=True
    )
    val_loader = DataLoader(
        val_ds, args.batch, shuffle=False, num_workers=0, pin_memory=True
    )

    labels = [c for c, _ in sorted(train_ds.class_to_idx.items(), key=lambda x: x[1])]
    print(f"🏷️  Labels ({len(labels)}): {labels}")

    os.makedirs(os.path.dirname(args.labels_out), exist_ok=True)
    with open(args.labels_out, "w") as f:
        json.dump(labels, f, indent=2)

    # ─── Model ────────────────────────────────────────────
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    for p in model.parameters():
        p.requires_grad = False

    num_ftrs = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(num_ftrs, len(labels)),
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=args.lr)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3, factor=0.5)

    # ─── Training ─────────────────────────────────────────
    best_acc, best_state = 0.0, None
    for epoch in range(1, args.epochs + 1):
        model.train()
        loss_sum = 0.0
        for images, targets in train_loader:
            images, targets = (
                images.to(device, non_blocking=True),
                targets.to(device, non_blocking=True),
            )
            optimizer.zero_grad(set_to_none=True)
            loss = criterion(model(images), targets)
            loss.backward()
            optimizer.step()
            loss_sum += loss.item()

        model.eval()
        correct = total = 0
        with torch.no_grad():
            for images, targets in val_loader:
                images, targets = (
                    images.to(device, non_blocking=True),
                    targets.to(device, non_blocking=True),
                )
                _, preds = torch.max(model(images), 1)
                total += targets.size(0)
                correct += (preds == targets).sum().item()

        acc = 100.0 * correct / total
        avg_loss = loss_sum / len(train_loader)
        scheduler.step(avg_loss)

        marker = ""
        if acc > best_acc:
            best_acc = acc
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}
            marker = " 🏆"

        print(
            f"Epoch {epoch:2d}/{args.epochs} | Loss: {avg_loss:.4f} | Acc: {acc:.2f}%{marker}"
        )

    print(f"\n✅ Best: {best_acc:.2f}%")

    # ─── Export ONNX ──────────────────────────────────────
    if best_state:
        model.load_state_dict(best_state)
    model.eval()
    model.to("cpu")

    os.makedirs(os.path.dirname(args.model_out), exist_ok=True)
    dummy = torch.randn(1, 3, 224, 224)

    try:
        torch.onnx.export(
            model,
            dummy,
            args.model_out,
            input_names=["input"],
            output_names=["output"],
            opset_version=15,
        )
        print(f"✅ ONNX: {args.model_out}")
    except Exception as e:
        print(f"⚠️  ONNX gagal: {e}")
        torch.save(best_state, "output/checkpoint.pth")
        print("✅ Checkpoint: output/checkpoint.pth")

    print(f"✅ Labels: {args.labels_out}")
    print("🎯 Selesai!")


if __name__ == "__main__":
    main()
