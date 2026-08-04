# Getting Started

Panduan cepat untuk menjalankan Ecoguard di lokal.

## Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) atau Docker Engine (Linux)
- [Node.js](https://nodejs.org/) ≥ 18 (untuk frontend)
- [Git](https://git-scm.com/)
- Python 3.12+ (untuk training / development service tertentu)

## Clone Project

```bash
git clone https://github.com/reven-erlangga/ecoguardian.git
cd ecoguardian
```

## Jalankan Semua Service (Docker Compose)

Cara termudah — satu perintah jalanin semua infrastruktur + backend:

```bash
cd infra
docker compose up -d
```

Ini akan membuild dan menjalankan **16 container**:

```
ecoguard-pg-user         # PostgreSQL (user & auth)
ecoguard-pg-notif        # PostgreSQL (notification)
ecoguard-pgbouncer       # Connection pool
ecoguard-mongo           # MongoDB (twitter, issue, blockchain)
ecoguard-rabbitmq        # Message queue + management UI
ecoguard-redis           # Cache
ecoguard-vault           # Secret management
ecoguard-classification  # Image classification
ecoguard-nlp             # NLP processing
ecoguard-user-auth       # Auth service
ecoguard-notification    # Notification service
ecoguard-twitter         # Twitter ingestion
ecoguard-blockchain      # Blockchain
ecoguard-issue           # Issue reporting
ecoguard-asset           # Asset management
ecoguard-gateway         # GraphQL gateway
```

Cek status:

```bash
docker compose ps
```

Semua harus `Up`.

## Jalankan Frontend (terpisah)

Frontend jalan di luar Docker untuk development cepat:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:4321`.

## Cek Service

### Health Check

```bash
# Gateway
curl http://localhost:4000/health

# Classification Service
curl http://localhost:8083/health

# RabbitMQ Management UI
# Buka http://localhost:15672 (guest/guest)
```

### Test Classification

```bash
curl -X POST -F "image=@foto_sampah.jpg" http://localhost:8083/classify
```

Response:

```json
{
  "label": "garbage",
  "confidence": 0.97,
  "candidates": [
    {"label": "garbage", "confidence": 0.97},
    {"label": "road_damage", "confidence": 0.01}
  ]
}
```

## Matikan Semua

```bash
cd infra
docker compose down
```

Untuk menghapus volumes (data database hilang):

```bash
docker compose down -v
```

## Port Map

| Port | Service |
|------|---------|
| 4000 | Gateway (GraphQL) |
| 5432 | PostgreSQL (user) |
| 5433 | PostgreSQL (notif) |
| 6432 | pgBouncer |
| 5672 | RabbitMQ (AMQP) |
| 15672 | RabbitMQ (Management UI) |
| 6379 | Redis |
| 8200 | Vault |
| 27017 | MongoDB |
| 50051 | User Auth (gRPC) |
| 50052 | Twitter (gRPC) |
| 50053 | Classification (gRPC) |
| 50054 | Notification (gRPC) |
| 50055 | NLP (gRPC) |
| 50056 | Blockchain (gRPC) |
| 50057 | Issue (gRPC) |
| 50058 | Asset (gRPC) |
| 8083 | Classification (HTTP) |
| 8088 | Asset (HTTP) |
| 8000 | Twitter (HTTP) |

## Troubleshooting

### Port sudah dipake
Ubah port di `infra/docker-compose.yml` bagian `ports:`.

### Container crash
```bash
docker compose logs <container-name>
# Contoh:
docker compose logs classification-service
```

### Build ulang service tertentu
```bash
docker compose build classification-service
docker compose up -d classification-service
```
