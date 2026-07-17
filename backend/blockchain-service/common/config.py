import os


class Config:
    GRPC_PORT = int(os.environ.get("GRPC_PORT", 50056))
    MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://mongodb:27017")
    BLOCKCHAIN_DB = os.environ.get("BLOCKCHAIN_DB", "ecoguard_blockchain")
    POW_DIFFICULTY = int(os.environ.get("POW_DIFFICULTY", 4))
