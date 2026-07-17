import os


class Config:
    GRPC_PORT = int(os.getenv("GRPC_PORT", "50057"))
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://mongodb:27017")
