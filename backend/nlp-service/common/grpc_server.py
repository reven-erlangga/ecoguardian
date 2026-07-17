import grpc
from concurrent import futures

from common.config import Config


def serve(servicer_cls, service_add_fn):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_add_fn(servicer_cls(), server)
    server.add_insecure_port(f"0.0.0.0:{Config.GRPC_PORT}")
    server.start()
    print(f"[gRPC] NLP Service listening on port {Config.GRPC_PORT}")
    server.wait_for_termination()
    return server
