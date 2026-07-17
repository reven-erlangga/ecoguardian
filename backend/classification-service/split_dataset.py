"""Split dataset jadi train/val/test (80/10/10)"""

import argparse
import os
import random
import shutil

parser = argparse.ArgumentParser()
parser.add_argument("--source", default="dataset")
parser.add_argument("--dest", default=".")
args = parser.parse_args()

src = args.source
dst = args.dest
split = (0.8, 0.1, 0.1)  # train, val, test

for label in sorted(os.listdir(src)):
    label_path = os.path.join(src, label)
    if not os.path.isdir(label_path):
        continue
    images = [
        f
        for f in os.listdir(label_path)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    random.shuffle(images)

    n_train = int(len(images) * split[0])
    n_val = int(len(images) * split[1])

    for part, names in [
        ("train", images[:n_train]),
        ("val", images[n_train : n_train + n_val]),
        ("test", images[n_train + n_val :]),
    ]:
        out_dir = os.path.join(dst, part, label)
        os.makedirs(out_dir, exist_ok=True)
        for name in names:
            shutil.copy(os.path.join(src, label, name), os.path.join(out_dir, name))
        print(f"  {part}/{label}: {len(names)} images")

print("✅ Split done!")
