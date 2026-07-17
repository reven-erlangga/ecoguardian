import time

from pymongo import MongoClient, ASCENDING, DESCENDING


class BlockRepository:
    def __init__(self, mongo_uri: str, db_name: str):
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.blocks = self.db["blocks"]
        # ponytail: best-effort index creation — retry on first op
        try:
            self._ensure_indexes()
        except Exception:
            pass

    def _ensure_indexes(self):
        self.blocks.create_index("index", unique=True)
        self.blocks.create_index("hash", unique=True)
        self.blocks.create_index("data.tweet_id")
        self.blocks.create_index("data.type")
        self.blocks.create_index([("timestamp", DESCENDING)])

    def _ensure_connected(self):
        """Retry index creation if it failed during init."""
        for _ in range(3):
            try:
                self.client.admin.command("ping")
                return
            except Exception:
                time.sleep(1)
        raise ConnectionError("Cannot connect to MongoDB")

    def get_last_block(self) -> dict | None:
        self._ensure_connected()
        return self.blocks.find_one(sort=[("index", DESCENDING)])

    def add_block(self, block: dict) -> bool:
        self._ensure_connected()
        try:
            self.blocks.insert_one(block)
            return True
        except Exception:
            return False

    def get_blocks_by_tweet(self, tweet_id: str) -> list:
        self._ensure_connected()
        return list(
            self.blocks.find({"data.tweet_id": tweet_id}, {"_id": 0}).sort(
                "index", ASCENDING
            )
        )

    def get_all_blocks(self) -> list:
        self._ensure_connected()
        return list(self.blocks.find({}, {"_id": 0}).sort("index", ASCENDING))

    def count_blocks(self) -> int:
        self._ensure_connected()
        return self.blocks.count_documents({})
