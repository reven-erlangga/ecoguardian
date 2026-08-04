import os

from .vault import read_secret


def _resolve_mongo_uri():
    val = os.getenv("MONGODB_URI")
    if val:
        return val
    vault = read_secret("ecoguard/db", "mongo-twitter-uri")
    if vault:
        return vault
    return "mongodb://mongodb:27017"


class Config:
    GRPC_PORT = int(os.getenv("GRPC_PORT", "50057"))
    MONGODB_URI = _resolve_mongo_uri()
    RABBITMQ_URI = os.getenv("RABBITMQ_URI", "amqp://guest:guest@rabbitmq:5672")
    REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
    CLUSTER_EPS_KM = float(os.getenv("CLUSTER_EPS_KM", "7.0"))
    CLUSTER_MIN_PTS = int(os.getenv("CLUSTER_MIN_PTS", "3"))
