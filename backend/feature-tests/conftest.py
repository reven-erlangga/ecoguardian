"""
Pytest fixtures for Ecoguard feature tests.

Fixtures create gRPC channels / HTTP sessions to running services.
Each fixture pings the service before yielding — tests are skipped
if the service is unreachable.
"""

import os
import socket
import sys
from pathlib import Path
from typing import Generator

import grpc
import pytest
import requests

# ─── Helpers ──────────────────────────────────────────────────────

SERVICE_PORTS = {
    "classification_grpc": int(os.getenv("CLASSIFICATION_GRPC_PORT", "50053")),
    "user_auth_grpc": int(os.getenv("USER_AUTH_GRPC_PORT", "50051")),
    "notification_grpc": int(os.getenv("NOTIFICATION_GRPC_PORT", "50054")),
    "twitter_http": int(os.getenv("TWITTER_HTTP_PORT", "8000")),
    "classification_http": int(os.getenv("CLASSIFICATION_HTTP_PORT", "8083")),
}


def port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """Return True if *host:port* accepts a TCP connection."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (OSError, socket.error):
        return False


def service_unavailable(group: str) -> str:
    """Return a skip-reason string, or None if the service is reachable."""
    host = os.getenv("SERVICE_HOST", "localhost")
    info = SERVICE_PORTS.get(group)
    if info is None:
        return f"unknown service group '{group}'"
    port = info if isinstance(info, int) else info
    if not port_open(host, port):
        return f"{group} not reachable at {host}:{port}"
    return ""


# ─── Try to add generated proto paths ────────────────────────────
# We search several known locations so tests work regardless of where
# ``buf generate`` (or the manual protoc invocation) placed the stubs.

_PROTO_SEARCH_DIRS = [
    Path(__file__).resolve().parent / "protogen",
    Path(__file__).resolve().parent / "proto",
    Path(__file__).resolve().parent.parent / "classification-service" / "protogen",
    Path(__file__).resolve().parent.parent / "user-auth-service" / "proto",
    Path(__file__).resolve().parent.parent / "notification-service" / "proto",
]

for _d in _PROTO_SEARCH_DIRS:
    if _d.is_dir():
        sys.path.insert(0, str(_d))

_HAVE_PROTO: bool = False
try:
    from classification import (
        classification_pb2 as class_pb2,
        service_pb2 as class_svc_pb2,
        service_pb2_grpc as class_svc_grpc,
    )
    from user import user_pb2, service_pb2 as user_svc_pb2, service_pb2_grpc as user_svc_grpc
    from notification import (
        notification_pb2 as notif_pb2,
        service_pb2 as notif_svc_pb2,
        service_pb2_grpc as notif_svc_grpc,
    )
    from common import common_pb2

    _HAVE_PROTO = True
except ImportError as exc:
    _HAVE_PROTO = False
    _PROTO_ERROR = str(exc)


def require_proto() -> None:
    """Skip the calling test if generated proto stubs are missing."""
    if not _HAVE_PROTO:
        pytest.skip(
            f"Generated protobuf stubs not found ({_PROTO_ERROR}).\n"
            f"  Run:  cd protobuf && buf generate\n"
            f"  Or:   cd backend/feature-tests && python compile_proto.py"
        )


# ─── Fixtures ─────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def http_session() -> Generator[requests.Session, None, None]:
    """Shared requests session with reasonable timeouts."""
    sess = requests.Session()
    sess.headers.update({"User-Agent": "ecoguard-feature-test/1.0"})
    yield sess
    sess.close()


@pytest.fixture(scope="session")
def classification_stub():
    """gRPC stub for ClassificationService (localhost:50053).

    Skips if the service or protobuf stubs are unavailable.
    """
    require_proto()
    host = os.getenv("SERVICE_HOST", "localhost")
    port = SERVICE_PORTS["classification_grpc"]
    reason = service_unavailable("classification_grpc")
    if reason:
        pytest.skip(reason)

    channel = grpc.insecure_channel(f"{host}:{port}")
    stub = class_svc_grpc.ClassificationServiceStub(channel)
    yield stub
    channel.close()


@pytest.fixture(scope="session")
def user_auth_stub():
    """gRPC stub for UserService + AuthService (localhost:50051).

    Skips if the service or protobuf stubs are unavailable.
    """
    require_proto()
    host = os.getenv("SERVICE_HOST", "localhost")
    port = SERVICE_PORTS["user_auth_grpc"]
    reason = service_unavailable("user_auth_grpc")
    if reason:
        pytest.skip(reason)

    channel = grpc.insecure_channel(f"{host}:{port}")
    user_stub = user_svc_grpc.UserServiceStub(channel)
    auth_stub = user_svc_grpc.AuthServiceStub(channel)
    yield user_stub, auth_stub
    channel.close()


@pytest.fixture(scope="session")
def notification_stub():
    """gRPC stub for NotificationService (localhost:50054).

    Skips if the service or protobuf stubs are unavailable.
    """
    require_proto()
    host = os.getenv("SERVICE_HOST", "localhost")
    port = SERVICE_PORTS["notification_grpc"]
    reason = service_unavailable("notification_grpc")
    if reason:
        pytest.skip(reason)

    channel = grpc.insecure_channel(f"{host}:{port}")
    stub = notif_svc_grpc.NotificationServiceStub(channel)
    yield stub
    channel.close()


@pytest.fixture(scope="session")
def twitter_http_base() -> str:
    """Base URL for the Twitter Service HTTP endpoints."""
    host = os.getenv("SERVICE_HOST", "localhost")
    port = SERVICE_PORTS["twitter_http"]
    reason = service_unavailable("twitter_http")
    if reason:
        pytest.skip(reason)
    return f"http://{host}:{port}"


@pytest.fixture(scope="session")
def classification_http_base() -> str:
    """Base URL for the Classification Service HTTP endpoints."""
    host = os.getenv("SERVICE_HOST", "localhost")
    port = SERVICE_PORTS["classification_http"]
    reason = service_unavailable("classification_http")
    if reason:
        pytest.skip(reason)
    return f"http://{host}:{port}"
