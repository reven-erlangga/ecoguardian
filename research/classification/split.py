"""
Image cleaning + split 80/10/10

1. Baca gambar mentah dari collections/ (folder per label)
2. Hapus datasets/ kalo sudah ada (start clean)
3. Resize 512×512, konversi ke .jpg
4. Split 80/10/10 ke datasets/train|val|test/
5. Rename urut per label per split (1.jpg, 2.jpg, ...)
"""

import argparse
import os
import random
import shutil

from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument(
    "--source", default="collections", help="Folder sumber (subfolder per label)"
)
parser.add_argument("--out", default="datasets", help="Folder output datasets")
parser.add_argument("--size", type=int, default=512, help="Resize ke ukuran ini (px)")
args = parser.parse_args()

src, out, size = args.source, args.out, (args.size, args.size)

# ─── 1. Hapus datasets/ lama ─────────────────────────────
if os.path.exists(out):
    print(f"🧹 Hapus {out}/ lama...")
    shutil.rmtree(out)

# ─── 2. Kumpulin semua gambar dari collections/ ──────────
all_imgs = []  # [(path, label)]
for label in sorted(os.listdir(src)):
    folder = os.path.join(src, label)
    if not os.path.isdir(folder):
        continue
    files = sorted(
        f for f in os.listdir(folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))
    )
    for f in files:
        all_imgs.append((os.path.join(folder, f), label))
    print(f"  📥 {label}: {len(files)} gambar")

random.shuffle(all_imgs)

# ─── 3. Split ────────────────────────────────────────────
n_val = int(len(all_imgs) * 0.1)
n_test = int(len(all_imgs) * 0.1)

splits = {
    "train": all_imgs[n_val + n_test :],
    "val": all_imgs[:n_val],
    "test": all_imgs[n_val : n_val + n_test],
}

# ─── 4. Copy + resize + rename urut ──────────────────────
for part, indices in splits.items():
    # Hitung starting number per label per split
    counters = {}  # label → next_number
    print(f"\n📁 {part}/ ({len(indices)} gambar)")

    for src_path, label in indices:
        dst_dir = os.path.join(out, part, label)
        os.makedirs(dst_dir, exist_ok=True)

        # Cek file yang udah ada di folder tujuan (fallback safety)
        if label not in counters:
            existing = [f for f in os.listdir(dst_dir) if f.endswith(".jpg")]
            counters[label] = len(existing) + 1

        new_name = f"{counters[label]}.jpg"
        counters[label] += 1
        dst_path = os.path.join(dst_dir, new_name)

        # Resize — aspect ratio preserved, padded to square
        img = Image.open(src_path).convert("RGB")
        img.thumbnail(size, Image.LANCZOS)
        canvas = Image.new("RGB", size, (0, 0, 0))
        x = (size[0] - img.width) // 2
        y = (size[1] - img.height) // 2
        canvas.paste(img, (x, y))
        canvas.save(dst_path, quality=95)

print(f"\n✅ Selesai! Datasets ({len(all_imgs)} gambar) → {out}/")
print(f"   Train: {len(splits['train'])}")
print(f"   Val:   {len(splits['val'])}")
print(f"   Test:  {len(splits['test'])}")
