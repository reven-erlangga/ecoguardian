from concurrent import futures

import grpc


def serve_grpc(service_class, port: int):
    """Start gRPC server untuk satu service."""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_class(server)
    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    print(f"✅ gRPC server listening on port {port}")
    return server
