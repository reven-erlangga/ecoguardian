# Development

Panduan development untuk mengerjakan service Ecoguard.

## Prasyarat

- Python 3.12+ (backend Python services)
- Rust toolchain (twitter-service)
- Node.js 18+ (gateway, frontend)
- Docker Desktop (infrastruktur: PostgreSQL, MongoDB, RabbitMQ)
- Docker Compose

## Development Workflow

### 1. Jalankan Infrastructure

Untuk development lokal, cukup jalankan infrastruktur via Docker:

```bash
cd infra
docker compose up postgres-user postgres-notif mongodb rabbitmq redis vault -d
```

Ini akan menjalankan database dan message queue tanpa backend services.

### 2. Jalankan Service yang Dikerjakan

Jalankan service secara langsung (bukan via Docker) untuk hot-reload:

```bash
# Python service
cd backend/classification-service
pip install -r requirements.txt
python server.py

# Rust service (butuh Rust toolchain)
cd backend/twitter-service
cargo run
```

### 3. Jalankan Gateway

```bash
cd infra/gateway
npm install
npm run dev
```

### 4. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

## Service Dependencies

| Service | Butuh Infrastructure | Butuh Service Lain |
|---------|---------------------|-------------------|
| classification-service | - | - |
| user-auth-service | PostgreSQL (user) | - |
| twitter-service | MongoDB, RabbitMQ | classification, nlp, asset |
| notification-service | PostgreSQL (notif), RabbitMQ | - |
| nlp-service | PostgreSQL, Redis | - |
| blockchain-service | MongoDB, RabbitMQ | - |
| issue-service | MongoDB | - |
| asset-service | - | - |
| gateway | RabbitMQ | Semua backend services |

## Proto Development

### Install Buf

```bash
# Windows
choco install buf

# Linux/Mac
brew install buf
```

### Generate Proto

```bash
cd protobuf
buf generate
```

Ini akan generate stubs ke masing-masing service.

## Testing

### Python Services

```bash
cd backend/classification-service
pytest tests/
```

### Rust Service

```bash
cd backend/twitter-service
cargo test
```

### Frontend

```bash
cd frontend
npm run test
```

## Code Organization

### Feature-Driven Structure

Kode diorganisir per **fitur**, bukan per layer:

```
service/
├── feature_a/        ← Satu fitur
│   ├── handler.py    ← Entry points (gRPC handlers)
│   ├── service.py    ← Business logic
│   └── repository.py ← Database access
├── feature_b/
└── common/           ← Shared utilities
```

### Branch Strategy

```bash
main           ← Production-ready
├── feat/xxx   ← Feature development
└── fix/xxx    ← Bug fixes
```
