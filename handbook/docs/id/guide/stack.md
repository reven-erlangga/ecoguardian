# Stack Teknologi

## Frontend

| Teknologi | Kegunaan |
|-----------|----------|
| **Astro** | Static site generator / SSR |
| **React** | Component islands untuk interaktivitas |
| **URQL** | GraphQL client (koneksi ke gateway) |
| **TypeScript** | Type safety |

## Backend

| Service | Bahasa | Framework | Database | Komunikasi |
|---------|--------|-----------|----------|------------|
| **Gateway** | Rust | Rocket + async-graphql + tonic | - | GraphQL → gRPC |
| **Twitter Service** | Node.js | gRPC + Hono | MongoDB | gRPC + RabbitMQ |
| **Classification** | Python | Flask + grpcio | ONNX model | gRPC |
| **User & Auth** | Python | Flask + grpcio | PostgreSQL | gRPC |
| **Notification** | Python | Flask + grpcio | PostgreSQL | gRPC + RabbitMQ |
| **Asset** | Python | Flask + grpcio | ImageKit (cloud) | gRPC |
| **Issue** | Python | Flask + grpcio | MongoDB | gRPC |
| **Blockchain** | Python | Flask + grpcio | MongoDB | gRPC + RabbitMQ |
| **NLP** | Python | Flask + grpcio | PostgreSQL | gRPC |

## Infrastructure

| Teknologi | Kegunaan |
|-----------|----------|
| **Docker** | Containerization |
| **Docker Compose** | Local orchestration |
| **pgBouncer** | PostgreSQL connection pooling |
| **RabbitMQ** | Async message broker (event bus) |
| **Redis** | Caching (session, rate limit) |
| **ImageKit** | Cloud image upload & optimization |

## Protobuf

Semua contract service didefinisikan sebagai `.proto` files dan di-generate pakai **buf**:

```
protobuf/
├── common/common.proto       # Shared types (Timestamp, Pagination, Empty)
├── twitter/                  # TwitterService
├── user/                     # UserService + AuthService
├── classification/           # ClassificationService
├── notification/             # NotificationService
├── clustering/               # (future)
├── nlp/                      # (future)
└── blockchain/               # (future)
```

## Machine Learning

| Komponen | Teknologi |
|----------|-----------|
| **Model Architecture** | EfficientNet-B0 |
| **Framework** | PyTorch → ONNX |
| **Inference** | ONNX Runtime |
| **Image Size** | 224×224 (resize from 512×512) |
| **VRAM Minimum** | 4-6 GB (GTX 1660 Super) |

## DevOps

| Tools |
|-------|
| **Git** + GitHub |
| **Docker** + Docker Compose |
| **buf** (protobuf tooling) |
