import sys
import os
import time
import threading

# ponytail: append proto agar common/ & blockchain/ ditemukan
_proto = os.path.join(os.path.dirname(__file__), "proto")
sys.path.insert(0, _proto)

from blockchain import blockchain_pb2, service_pb2, service_pb2_grpc
from common import common_pb2
from common.config import Config
from common.grpc_server import serve
from chain.blockchain import Blockchain
from chain.repository import BlockRepository
from rabbitmq import BlockchainEventConsumer

cfg = Config()
chain = Blockchain(difficulty=cfg.POW_DIFFICULTY)
repo = BlockRepository(cfg.MONGODB_URI, cfg.BLOCKCHAIN_DB)

# ponytail: start RabbitMQ consumer in daemon thread
consumer = BlockchainEventConsumer(chain, repo)
t = threading.Thread(target=consumer.start, daemon=True)
t.start()


class BlockchainServicer(service_pb2_grpc.BlockchainServiceServicer):
    def RecordClassification(self, request, context):
        data = {
            "type": "classification",
            "tweet_id": request.tweet_id,
            "label": request.label,
            "confidence": request.confidence,
            "image_hash": request.image_hash,
            "location": {
                "lat": request.location.lat,
                "lon": request.location.lon,
                "address": request.location.address,
            }
            if request.location
            else None,
            "resolution": None,
        }
        return self._record(data)

    def RecordResolution(self, request, context):
        data = {
            "type": "resolution",
            "tweet_id": request.tweet_id,
            "label": "",
            "confidence": 0,
            "image_hash": "",
            "location": None,
            "resolution": {
                "admin_id": request.admin_id,
                "notes": request.notes,
                "resolved_image_hash": request.resolved_image_hash,
                "resolved_at": int(time.time()),
            },
        }
        return self._record(data)

    def _record(self, data: dict) -> blockchain_pb2.RecordResponse:
        last = repo.get_last_block()
        if not last:
            new_block = chain.create_genesis()
            repo.add_block(new_block)
            last = new_block
        new_block = chain.create_block(data, last)
        if repo.add_block(new_block):
            return blockchain_pb2.RecordResponse(
                block=_dict_to_block(new_block), success=True
            )
        return blockchain_pb2.RecordResponse(success=False, error="Failed to store block")

    def GetHistory(self, request, context):
        # ponytail: tweet_id kosong = semua block (untuk blockchain page)
        if request.tweet_id:
            blocks = repo.get_blocks_by_tweet(request.tweet_id)
        else:
            blocks = repo.get_all_blocks()
        return blockchain_pb2.GetHistoryResponse(
            blocks=[_dict_to_block(b) for b in blocks]
        )

    def VerifyChain(self, request, context):
        blocks = repo.get_all_blocks()
        valid, err = chain.is_valid_chain(blocks)
        return blockchain_pb2.VerifyResponse(
            valid=valid, blocks_count=len(blocks), error=err
        )


def _dict_to_block(b: dict) -> blockchain_pb2.Block:
    """Convert dict block to protobuf Block message."""
    pb = blockchain_pb2.Block(
        index=b["index"],
        timestamp=b["timestamp"],
        previous_hash=b["previous_hash"],
        hash=b["hash"],
        nonce=b["nonce"],
    )
    d = b["data"]
    pb.data.type = d["type"]
    pb.data.tweet_id = d["tweet_id"]
    pb.data.label = d["label"]
    pb.data.confidence = d["confidence"]
    pb.data.image_hash = d["image_hash"]
    if d.get("location"):
        loc = d["location"]
        pb.data.location.lat = loc["lat"]
        pb.data.location.lon = loc["lon"]
        pb.data.location.address = loc["address"]
    if d.get("resolution"):
        res = d["resolution"]
        pb.data.resolution.admin_id = res["admin_id"]
        pb.data.resolution.notes = res["notes"]
        pb.data.resolution.resolved_image_hash = res["resolved_image_hash"]
        pb.data.resolution.resolved_at = res["resolved_at"]
    return pb


if __name__ == "__main__":
    print(f"[Server] Starting Blockchain gRPC server on port {cfg.GRPC_PORT}...")
    serve(
        BlockchainServicer,
        service_pb2_grpc.add_BlockchainServiceServicer_to_server,
    )
