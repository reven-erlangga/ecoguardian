"""
Ecoguard Scraper — Manipulasi data BNPB.

Usage:
    python app.py
"""

import argparse
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"


def main():
    parser = argparse.ArgumentParser(description="Ecoguard Scraper")
    parser.add_argument("--limit", "-l", type=int, default=25, help="Data per label")
    args = parser.parse_args()

    from scrapers.manipulate import run
    path, data = run(args.limit)

    with_loc = sum(1 for d in data if d.get("location_mention"))
    print(f"\n📌 Langkah selanjutnya:")
    print(f"   cp data/dataset.json ../../backend/issue-service/features/clustering/models/tweets.json")
    print(f"   cd ../../backend/issue-service")
    print(f"   python -m features.clustering.service")


if __name__ == "__main__":
    main()
