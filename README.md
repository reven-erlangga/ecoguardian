# Ecoguard

Sistem klasifikasi citra berbasis **microservice** untuk deteksi pohon tumbang, sampah liar, dan vandalisme. Dibangun dengan arsitektur **GraphQL Gateway + gRPC microservices**, containerized via **Docker Compose**.

## Arsitektur

```
┌──────────────────────────────────────────────┐
│                 FRONTEND                      │
│        Astro + React Island + URQL            │
│               (GraphQL client)                │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│            GRAPHQL GATEWAY (Rust)             │
│   Rocket + async-graphql → gRPC via tonic     │
│   JWT validation · Rate limit · Aggregation   │
└──┬──────────┬──────────┬──────────┬──────────┘
   │ gRPC     │ gRPC     │ gRPC     │ gRPC
   ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│Twitter │ │Classify│ │ Auth   │ │ Notification│
│Service │ │Service │ │ Service│ │ Service     │
│(Rust)  │ │(Python)│ │(Python)│ │ (Python)    │
│MongoDB │ │ONNX    │ │Postgres│ │ Postgres    │
└────────┘ └────────┘ └────────┘ └────────────┘
                               │
                          RabbitMQ
                     (Event Bus · async)
```

## Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Astro + React islands + URQL |
| **Gateway** | Rust (Rocket + async-graphql + tonic) |
| **Microservices** | Rust / Python (Flask + gRPC) |
| **Inference** | PyTorch → ONNX Runtime |
| **Databases** | PostgreSQL (via pgBouncer), MongoDB |
| **Message Queue** | RabbitMQ |
| **Orchestration** | Docker Compose |
| **Contracts** | Protobuf (buf) |
| **Auth** | JWT (validated at gateway) |

## Struktur Project

```
ecoguard/
├── frontend/                    # Astro + React
├── backend/
│   ├── gateway/                 # Rust — GraphQL gateway
│   ├── twitter-service/  # Node.js — Twitter ingestion
│   ├── classification-service/  # Python — ONNX inference
│   ├── user-auth-service/       # Python — Auth + user management
│   ├── notification-service/    # Python — Email/Telegram
│   ├── asset-service/           # Asset management
│   ├── issue-service/           # Issue reporting
│   ├── blockchain-service/      # Blockchain integration
│   └── nlp-service/             # NLP processing
├── training/                    # Model training pipeline
├── infra/                       # Docker Compose, DB init scripts
├── protobuf/                    # Shared proto definitions
│   └── common/, twitter/, user/, ...
```

## Memulai

```bash
# Clone repo
git clone https://github.com/reven-erlangga/ecoguardian.git
cd ecoguardian

# Lihat panduan tiap service:
# - training/README.md   → Training model
# - backend/*/README.md  → Service documentation
# - infra/               → Deployment
```

## Services

| Service | Bahasa | Database | Deskripsi |
|---------|--------|----------|-----------|
| **gateway** | Rust | - | GraphQL → gRPC translator, JWT auth |
| **twitter-service** | Node.js | MongoDB | Ingest & query tweet |
| **classification-service** | Python | ONNX model | Klasifikasi gambar |
| **user-auth-service** | Python | PostgreSQL | User CRUD + JWT generation |
| **notification-service** | Python | PostgreSQL | Email/Telegram via RabbitMQ |
| **asset-service** | Python | PostgreSQL | Asset/image management |
| **issue-service** | Python | PostgreSQL | Issue/keluhan reporting |
| **blockchain-service** | Python | PostgreSQL | Blockchain integration |
| **nlp-service** | Python | PostgreSQL | Natural language processing |

## Prinsip Desain

- **Satu service, satu responsibility**
- **Tiap service punya database sendiri** — no sharing
- **Sync** via gRPC (protobuf), **Async** via RabbitMQ
- **Gateway tidak punya business logic** — hanya translate + aggregate
- **Feature-driven** — kode diorganisir per fitur, bukan per layer
