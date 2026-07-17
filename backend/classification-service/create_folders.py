import json
import os

labels = ["vandalism", "fallen_tree", "garbage"]

for split_name in ["train", "val", "test"]:
    os.makedirs(f"dataset/{split_name}", exist_ok=True)
    for label in labels:
        os.makedirs(f"dataset/{split_name}/{label}", exist_ok=True)

print("folder created")
