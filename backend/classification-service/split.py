import os
import random
import shutil

src = "dataset/train"
parts = {"val": 0.1, "test": 0.1}

for label in sorted(os.listdir(src)):
    path = os.path.join(src, label)
    if not os.path.isdir(path):
        continue
    images = [
        f for f in os.listdir(path) if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]
    random.shuffle(images)
    n_val = int(len(images) * 0.1)
    n_test = int(len(images) * 0.1)

    for part_name, count, img_list in [
        ("val", n_val, images[:n_val]),
        ("test", n_test, images[n_val : n_val + n_test]),
    ]:
        out = os.path.join("dataset", part_name, label)
        os.makedirs(out, exist_ok=True)
        for f in img_list:
            shutil.copy(os.path.join(path, f), os.path.join(out, f))
        print(f"  {part_name}/{label}: {len(img_list)}")

print("✅ Done")
