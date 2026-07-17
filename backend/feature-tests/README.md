# Feature Tests — Ecoguard

End-to-end integration tests that exercise every **running** service over gRPC and HTTP.  
Tests gracefully skip when the target service is unreachable, so you can run them against any subset of services.

## Prerequisites

- Python 3.10+
- All services you want to test must be running (see [docker-compose.yml](../../infra/docker-compose.yml) for infra dependencies)
- Generated protobuf stubs (see below)

## Setup

```bash
cd backend/feature-tests
python -m venv .venv
source .venv/bin/activate    # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Generate Protobuf Stubs

The tests need Python gRPC stubs compiled from the `.proto` files.  
You have two options:

**Option A — Use `buf` (recommended):**

```bash
cd protobuf
buf generate
```

This places generated stubs under `protobuf/<lang>/` directories.  
The `conftest.py` automatically searches several paths including
`backend/classification-service/protogen/`, `backend/user-auth-service/proto/`, etc.

**Option B — Manual `protoc`:**

If you don't have `buf`, the individual services already have their stubs
generated in their own `proto/` or `protogen/` directories.
The conftest discovers them automatically.

### Verify Proto Stubs Are Found

```bash
python -c "from conftest import _HAVE_PROTO; print('Proto OK' if _HAVE_PROTO else 'Proto MISSING')"
```

## Running Tests

```bash
# From backend/feature-tests/
pytest -v
```

Tests will **skip** (not fail) when a service isn't running:

```
PASSED test_classification_flow.py::TestClassificationFlow::test_classify_image_returns_required_fields
SKIPPED test_auth_flow.py::TestAuthFlow::test_register_then_login_then_validate  — user-auth gRPC not reachable
```

### Run Only a Subset

```bash
pytest -v -k "classification"   # only classification tests
pytest -v -k "auth or notify"   # only auth and notification
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SERVICE_HOST` | `localhost` | Hostname where services are listening |
| `CLASSIFICATION_GRPC_PORT` | `50053` | Classification gRPC port |
| `USER_AUTH_GRPC_PORT` | `50051` | User & Auth gRPC port |
| `NOTIFICATION_GRPC_PORT` | `50054` | Notification gRPC port |
| `TWITTER_HTTP_PORT` | `8000` | Twitter Service HTTP port |
| `CLASSIFICATION_HTTP_PORT` | `8083` | Classification Service HTTP port |

### Example: Run Against a Remote Cluster

```bash
SERVICE_HOST=192.168.1.50 pytest -v
```

## Test Layout

| File | What it tests |
|---|---|
| `test_classification_flow.py` | gRPC `ClassifyImage` — image input, label/confidence/candidates output |
| `test_auth_flow.py` | gRPC Register → Login → ValidateToken → GetUser |
| `test_trigger_classify.py` | HTTP `POST /trigger-classify` on the Twitter Service |
| `test_notification_flow.py` | gRPC SendNotification → GetNotifications → MarkRead |
| `test_full_flow.py` | **End-to-end pipeline** — Register → HTTP trigger-classify → poll Notifications (all services required) |
