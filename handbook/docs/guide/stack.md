# Tech Stack

## Frontend

| Technology | Usage |
|-----------|-------|
| **Astro** | Static site generator / SSR |
| **Svelte** | Interactive component islands |
| **URQL** | GraphQL client (connects to gateway) |
| **TypeScript** | Type safety |
| **TailwindCSS** | Styling |

## Backend

| Service | Language | Framework | Database | Communication |
|---------|----------|-----------|----------|---------------|
| **Gateway** | Node.js | GraphQL Mesh | - | GraphQL → gRPC |
| **Twitter Service** | Node.js | gRPC + Hono | MongoDB | gRPC + RabbitMQ |
| **Classification** | Python | Flask + grpcio | ONNX model | gRPC |
| **User & Auth** | Python | Flask + grpcio | PostgreSQL | gRPC |
| **Notification** | Python | Flask + grpcio | PostgreSQL | gRPC + RabbitMQ |
| **Asset** | Python | Flask + grpcio | ImageKit (cloud) | gRPC |
| **Issue** | Python | grpcio | MongoDB | gRPC |
| **Blockchain** | Python | Flask + grpcio | MongoDB | gRPC + RabbitMQ |
| **NLP** | Python | Flask + grpcio | PostgreSQL | gRPC |

## Infrastructure

| Technology | Usage |
|-----------|-------|
| **Docker** | Containerization |
| **Docker Compose** | Local orchestration |
| **pgBouncer** | PostgreSQL connection pooling |
| **RabbitMQ** | Async message broker (event bus) |
| **Redis** | Caching (session, geocoding) |
| **ImageKit** | Cloud image upload & optimization |

## Protobuf

All service contracts are defined as `.proto` files and generated using **buf**:

```
protobuf/
├── common/common.proto       # Shared types
├── twitter/                  # TwitterService
├── user/                     # UserService + AuthService
├── classification/           # ClassificationService
├── notification/             # NotificationService
├── asset/                    # AssetService
├── issue/                    # IssueService
├── blockchain/               # BlockchainService
├── nlp/                      # NLPService
└── dashboard/                # DashboardService
```

## Machine Learning

| Component | Technology |
|-----------|-----------|
| **Model Architecture** | EfficientNet-B0 |
| **Framework** | PyTorch → ONNX |
| **Inference** | ONNX Runtime |
| **Image Size** | 224×224 (resized from 512×512) |
| **VRAM Minimum** | 4-6 GB (GTX 1660 Super) |

## DevOps

| Tools |
|-------|
| **Git** + GitHub |
| **Docker** + Docker Compose |
| **buf** (protobuf tooling) |
