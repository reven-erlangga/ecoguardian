# Getting Started

Quick guide to run Ecoguard locally.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine (Linux)
- [Node.js](https://nodejs.org/) ≥ 18 (for frontend)
- [Git](https://git-scm.com/)
- Python 3.12+ (for training / service development)

## Clone

```bash
git clone https://github.com/reven-erlangga/ecoguardian.git
cd ecoguardian
```

## Run All Services (Docker Compose)

```bash
cd infra
docker compose up -d
```

This builds and starts **16 containers**:

```
ecoguard-pg-user         # PostgreSQL (user & auth)
ecoguard-pg-notif        # PostgreSQL (notification)
ecoguard-pgbouncer       # Connection pool
ecoguard-mongo           # MongoDB
ecoguard-rabbitmq        # Message queue + management UI
ecoguard-redis           # Cache
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

Check status:

```bash
docker compose ps
```

All should show `Up`.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:4321`.

## Health Checks

```bash
# Gateway
curl http://localhost:4000/health

# Classification Service
curl http://localhost:8083/health

# RabbitMQ Management UI
# Open http://localhost:15672 (guest/guest)
```

## Test Classification

```bash
curl -X POST -F "image=@photo.jpg" http://localhost:8083/classify
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

## Stop Everything

```bash
cd infra
docker compose down
```

To also remove volumes (data loss):

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
| 15672 | RabbitMQ (Management) |
| 6379 | Redis |
| 27017 | MongoDB |
| 50051-58 | Backend services (gRPC) |
| 8083 | Classification (HTTP) |
| 8088 | Asset (HTTP) |
| 8000 | Twitter (HTTP) |
