import hashlib
import json
import time


class Blockchain:
    """Simple blockchain with proof-of-work."""

    def __init__(self, difficulty: int = 4):
        self.difficulty = difficulty
        self.prefix = "0" * difficulty

    def create_genesis(self) -> dict:
        """Create the first block."""
        block = {
            "index": 0,
            "timestamp": int(time.time()),
            "previous_hash": "0" * 64,
            "data": {
                "type": "genesis",
                "tweet_id": "",
                "label": "",
                "confidence": 0.0,
                "image_hash": "",
                "location": None,
                "resolution": None,
            },
            "nonce": 0,
        }
        block["hash"] = self._mine(block)
        return block

    def create_block(self, data: dict, prev_block: dict) -> dict:
        """Create a new block linked to previous block."""
        block = {
            "index": prev_block["index"] + 1,
            "timestamp": int(time.time()),
            "previous_hash": prev_block["hash"],
            "data": data,
            "nonce": 0,
        }
        block["hash"] = self._mine(block)
        return block

    def _mine(self, block: dict) -> str:
        """Proof-of-work: find nonce that produces hash with leading zeros."""
        while True:
            h = self._hash(block)
            if h.startswith(self.prefix):
                return h
            block["nonce"] += 1

    def _hash(self, block: dict) -> str:
        raw = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(raw).hexdigest()

    def is_valid_block(self, block: dict, prev_block: dict) -> bool:
        """Validate a block against its previous block."""
        if block["previous_hash"] != prev_block["hash"]:
            return False
        if block["index"] != prev_block["index"] + 1:
            return False
        # Verify hash integrity
        h = self._hash({k: v for k, v in block.items() if k != "hash"})
        if not h.startswith(self.prefix):
            return False
        if block["hash"] != h:
            return False
        return True

    def is_valid_chain(self, blocks: list) -> tuple:
        """Validate the entire chain. Returns (valid: bool, error: str)."""
        if not blocks:
            return False, "Empty chain"
        if blocks[0]["index"] != 0 or blocks[0]["previous_hash"] != "0" * 64:
            return False, "Invalid genesis"
        for i in range(1, len(blocks)):
            if not self.is_valid_block(blocks[i], blocks[i - 1]):
                return False, f"Invalid block at index {blocks[i]['index']}"
        return True, ""
