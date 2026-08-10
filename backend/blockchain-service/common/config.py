import os


def _resolve_mongo_uri():
    return os.environ.get("MONGODB_URI", "mongodb://mongodb:27017")


class Config:
    GRPC_PORT = int(os.environ.get("GRPC_PORT", 50056))
    MONGODB_URI = _resolve_mongo_uri()
    BLOCKCHAIN_DB = os.environ.get("BLOCKCHAIN_DB", "ecoguard_blockchain")
    POW_DIFFICULTY = int(os.environ.get("POW_DIFFICULTY", 4))
    RABBITMQ_URI = os.environ.get("RABBITMQ_URI", "amqp://guest:guest@rabbitmq:5672")
