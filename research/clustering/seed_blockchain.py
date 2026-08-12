"""Seeder blockchain — mencatat klasifikasi beberapa tweet ke blockchain
untuk membuktikan rantai blok terbentuk (previous_hash → hash).

Membaca tweet dari MongoDB ecoguard_twitter, lalu memanggil
BlockchainService.RecordClassification untuk tiap tweet sehingga terbentuk
rantai blok yang valid.

Cara pakai:
    python seed_blockchain.py
    python seed_blockchain.py --limit 5
"""

import argparse
import json
import sys

import grpc

sys.path.insert(0, "proto")

from blockchain import service_pb2, service_pb2_grpc  # noqa: E402
from blockchain import blockchain_pb2  # noqa: E402
from pymongo import MongoClient  # noqa: E402


def get_tweets(mongo_uri: str, limit: int) -> list:
    client = MongoClient(mongo_uri)
    db = client["ecoguard_twitter"]
    tweets = []
    for doc in db.tweets.find().sort("created_at", -1).limit(limit):
        tweets.append(
            {
                "tweet_id": doc.get("tweet_id", ""),
                "label": (doc.get("classification") or {}).get("image", {}).get("label", "")
                or (doc.get("classification") or {}).get("text", {}).get("label", ""),
                "confidence": float(
                    (doc.get("classification") or {}).get("image", {}).get("confidence", 0)
                    or (doc.get("classification") or {}).get("text", {}).get("confidence", 0)
                ),
                "image_hash": (doc.get("media_urls") or [""])[0],
                "location": doc.get("location") or {},
            }
        )
    return tweets


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mongo", default="mongodb://localhost:27017")
    parser.add_argument("--blockchain", default="localhost:50056")
    parser.add_argument("--limit", type=int, default=5)
    args = parser.parse_args()

    tweets = get_tweets(args.mongo, args.limit)
    if not tweets:
        print("Tidak ada tweet ditemukan di MongoDB.")
        return

    channel = grpc.insecure_channel(args.blockchain)
    stub = service_pb2_grpc.BlockchainServiceStub(channel)

    print(f"Mencatat {len(tweets)} klasifikasi tweet ke blockchain...\n")
    for t in tweets:
        loc = t["location"]
        req = blockchain_pb2.RecordClassificationRequest(
            tweet_id=t["tweet_id"],
            label=t["label"] or "environmental_issue",
            confidence=t["confidence"] or 0.0,
            image_hash=t["image_hash"] or "",
            location=blockchain_pb2.Location(
                lat=float(loc.get("lat", 0)),
                lon=float(loc.get("lon", 0)),
                address=loc.get("address", ""),
            ),
        )
        try:
            resp = stub.RecordClassification(req)
            block = resp.block
            print(f"✅ tweet={t['tweet_id']} label={t['label'] or 'env'} index={block.index}")
        except Exception as e:
            print(f"❌ tweet={t['tweet_id']} gagal: {e}")

    print("\nSelesai. Cek rantai blok di MongoDB ecoguard_blockchain.blocks")


if __name__ == "__main__":
    main()
