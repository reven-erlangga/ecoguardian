# Development

Guide for developing Ecoguard services locally.

## Prerequisites

- Python 3.12+ (Python services)
- Rust toolchain (twitter-service)
- Node.js 18+ (gateway, frontend)
- Docker Desktop (infrastructure)
- Docker Compose

## Workflow

### 1. Start Infrastructure

Run only databases and message queue via Docker:

```bash
cd infra
docker compose up postgres-user postgres-notif mongodb rabbitmq redis vault -d
```

### 2. Run Service Directly

```bash
# Python
cd backend/classification-service
pip install -r requirements.txt
python server.py

# Rust
cd backend/twitter-service
cargo run
```

### 3. Run Gateway

```bash
cd infra/gateway
npm install
npm run dev
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Proto Development

```bash
# Install buf
cd protobuf
buf generate
```

## Testing

```bash
# Python
cd backend/classification-service
pytest tests/

# Rust
cd backend/twitter-service
cargo test

# Frontend
cd frontend
npm run test
```
