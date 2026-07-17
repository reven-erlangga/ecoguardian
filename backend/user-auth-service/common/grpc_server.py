from concurrent import futures

import grpc


def serve_grpc(serve_fn, port: int):
    """Start gRPC server and register services via serve_fn(server)."""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    serve_fn(server)
    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    print(f"✅ gRPC server listening on port {port}")
    return server
