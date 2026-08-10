# Ecoguard — Agent Rules

## Cara Kerja Agent

1. **Buat implementation plan** sebelum menulis kode untuk task non-trivial.
2. **Jangan edit hal yang tidak diminta**. Strict scope.
3. **Fokus ke hal yang diminta saja**. No gold-plating.
4. **Pahami context dulu**. Kalau tidak paham, tanya — jangan tebak.
5. **Kamu adalah senior dev**. Bertanggung jawab atas kualitas dan keputusan teknis.

## Ponytail: Lazy Senior Dev Mode

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:

1. **YAGNI** — does this need to exist? Skip it.
2. **Reuse** — already in this codebase? Use it, don't rewrite.
3. **Stdlib** — standard library covers it? Use it.
4. **Native** — native platform feature covers it? Use it.
5. **Dependency** — already-installed dependency solves it? Use it.
6. **One line** — can it be one line? Make it one line.
7. **Minimum** — only then write the minimum that works.

The ladder runs **after** you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb.

**Bug fix = root cause, not symptom**: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken.

Rules:
- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion > addition. Boring > clever. Fewest files possible.
- **Shortest working diff wins** — but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size — lazy means less code, not the flimsier algorithm.
- Mark intentional simplifications with a `ponytail:` comment. If the shortcut has a known ceiling (global lock, O(n²) scan, naive heuristic), the comment names the ceiling and the upgrade path.

**Not lazy about**: understanding the problem (read it fully and trace the real flow before picking a rung — a small diff you don't understand is just laziness dressed up as efficiency), input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested.

Lazy code without its check is unfinished: non-trivial logic leaves **ONE** runnable check behind — the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test.

## Stack Project

- **Frontend**: Astro + React islands + URQL (GraphQL client)
- **Gateway**: Rust (`Rocket` + `async-graphql` + `tonic`)
- **Twitter Service**: Node.js (`gRPC` + `Hono` + MongoDB)
- **Classification Service**: Python (`Flask` + `grpcio`)
- **User & Auth Service**: Python (`Flask` + `grpcio` + Postgres)
- **Notification Service**: Python (`Flask` + `grpcio` + Postgres)
- **Clustering Service** (future): Python (`Flask` + `grpcio` + Postgres)
- **NLP Service** (future): Python (`Flask` + `grpcio` + Postgres)
- **Blockchain Service** (future, perlu diskusi): TBD
- **Infra**: RabbitMQ untuk async processing
- **Protobuf**: Shared contract definitions, tooling pakai `buf`
- **Auth**: JWT — validate di gateway, forward claims via gRPC metadata
- **Infra**: Docker Compose (orchestrasi)
- **Database pooling**: pgBouncer

## Struktur Project

```
ecoguard/
├── frontend/               → Astro + React Island + URQL
├── backend/
│   ├── classification-service/ → Python (Flask + grpcio)
│   ├── user-auth-service/  → Python (Flask + grpcio + Postgres)
│   ├── notification-service/ → Python (Flask + grpcio + Postgres)
│   ├── clustering-service/ (future) → Python
│   ├── nlp-service/ (future) → Python
│   └── blockchain-service/ (future, ?) → TBD
├── infra/
│   ├── docker-compose.yml
│   ├── postgres/init.sql
│   ├── mongodb/init.js
│   └── rabbitmq/definitions.json
├── protobuf/               → Shared proto definitions + buf config
│   ├── buf.yaml
│   ├── buf.gen.yaml
│   ├── common/
│   │   └── common.proto
│   ├── twitter/
│   │   ├── twitter.proto
│   │   └── service.proto
│   ├── user/
│   │   ├── user.proto
│   │   └── service.proto
│   ├── notification/
│   │   ├── notification.proto
│   │   └── service.proto
│   ├── classification/
│   │   ├── classification.proto
│   │   └── service.proto
│   ├── clustering/
│   │   ├── clustering.proto
│   │   └── service.proto (future)
│   ├── nlp/
│   │   ├── nlp.proto
│   │   └── service.proto (future)
│   └── blockchain/
│       ├── blockchain.proto
│       └── service.proto (future, ?)
└── AGENTS.md
```

## Arsitektur

```
┌────────────────────────────────────────────────────────────┐
│              FRONTEND (Astro + React Island)                │
│           URQL (GraphQL client) → HTTP/WS                   │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│        GRAPHQL GATEWAY (Rust - Rocket + async-graphql)      │
│  • Auth (JWT validation)   • Rate limit                     │
│  • Translate GraphQL → gRPC calls                          │
│  • Aggregate multi-service response                        │
│  • Subscriptions → RabbitMQ consumer                       │
└─────┬──────────────────┬──────────────────┬────────────────┘
      │ gRPC              │ gRPC              │ gRPC
      ▼                   ▼                   ▼
┌────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────────┐
│  Twitter   │   │ Classifictn  │   │  User & Auth │   │ Notification   │
│  Service   │   │   Service    │   │   Service    │   │   Service      │
│  (Node.js) │   │ (Python)     │   │ (Python)     │   │  (Python)      │
├────────────┤   ├──────────────┤   ├──────────────┤   ├────────────────┤
│ MongoDB    │   │ ONNX Model   │   │ Postgres     │   │ Postgres       │
│ (tweets)   │   │ (gambar)     │   │ (relasi)     │   │ (relasi)       │
└────────────┘   └──────────────┘   └──────┬───────┘   └────────────────┘
                                           │
                                           │ RabbitMQ
                                           ▼
                                  ┌────────────────┐
                                  │  Event Bus     │
                                  │  ecoguard.events│
                                  └────────────────┘

Future: Clustering / NLP / Blockchain — butuh justification lebih lanjut
                                        │
                                        │ RabbitMQ
                                        ▼
                               ┌────────────────┐
                               │  Event Bus     │
                               │  ecoguard.events│
                               └────────────────┘
```

## Prinsip

- Tiap service punya **satu responsibility**
- Tiap service punya **database sendiri** — no sharing
- Komunikasi **sync** lewat gRPC (protobuf)
- Komunikasi **async** lewat RabbitMQ
- Gateway **tidak punya business logic** — hanya translate + aggregate
- Semua contract dimulai dari **protobuf definitions**
- **Design pattern: Feature-driven** — setiap fitur adalah module sendiri, bukan layer-based. Struktur kode per service diorganisir per fitur, bukan per layer (no `controllers/`, `models/`, `services/` folder global).

## Struktur Folder Detail

### backend/

```
backend/
├── gateway/                          # Rust — Rocket + async-graphql + tonic
│   ├── src/
│   │   ├── main.rs
│   │   ├── schema.rs                 # GraphQL schema (query, mutation, subscription)
│   │   ├── resolvers/                # GraphQL → gRPC translator per domain
│   │   │   ├── mod.rs
│   │   │   ├── auth.rs
│   │   │   ├── twitter.rs
│   │   │   ├── classification.rs
│   │   │   └── notification.rs
│   │   ├── auth/                     # JWT validation
│   │   │   ├── mod.rs
│   │   │   └── jwt.rs
│   │   ├── grpc_clients/             # Tonic generated clients
│   │   │   ├── mod.rs
│   │   │   ├── user.rs
│   │   │   ├── twitter.rs
│   │   │   ├── classification.rs
│   │   │   └── notification.rs
│   │   └── common/
│   │       ├── mod.rs
│   │       ├── error.rs
│   │       └── config.rs
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── .env.example
│
├── twitter-service/             # Node.js — gRPC + Hono + MongoDB
│   ├── src/
│   │   ├── server.js                 # Entry point
│   │   ├── grpc.js                   # TwitterService gRPC server
│   │   ├── http.js                   # Hono REST endpoints
│   │   ├── ingest.js                 # Feature: ingest pipeline (NLP→classify→issue)
│   │   ├── watcher.js                # Poll Recent Search → auto-ingest
│   │   ├── twitter.js                # OAuth 2.0 posting + mention search
│   │   ├── clients.js                # Downstream gRPC clients (Classify/NLP/Blockchain/Asset)
│   │   ├── rabbitmq.js               # Event publisher
│   │   ├── mongo.js                  # MongoDB connection
│   │   └── config.js                 # Config from env
│   ├── test/                         # Self-check
│   ├── package.json
│   └── Dockerfile
│
├── user-auth-service/                # Python — Flask + grpcio + Postgres
│   ├── user/                         # Feature: user CRUD
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── service.py
│   ├── auth/                         # Feature: auth
│   │   ├── __init__.py
│   │   ├── jwt.py
│   │   ├── password.py
│   │   └── service.py
│   ├── common/
│   │   ├── __init__.py
│   │   ├── db.py                     # pgBouncer pool
│   │   ├── config.py
│   │   └── grpc_server.py
│   ├── proto/                        # Generated dari protobuf
│   ├── migrations/                   # Alembic
│   │   ├── env.py
│   │   └── versions/
│   ├── server.py                     # gRPC entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── classification-service/           # Python — Flask + grpcio + ONNX
│   ├── classifier/                   # Feature: image classification
│   │   ├── __init__.py
│   │   ├── infer.py
│   │   └── labels.json
│   ├── models/                       # model.onnx (gak ikut git)
│   │   └── .gitkeep
│   ├── common/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── grpc_server.py
│   ├── proto/                        # Generated dari protobuf
│   ├── server.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
└── notification-service/             # Python — Flask + grpcio + Postgres + RabbitMQ
    ├── sender/                       # Feature: kirim notifikasi
    │   ├── __init__.py
    │   ├── email.py
    │   └── telegram.py
    ├── rabbitmq/                     # Consumer event bus
    │   ├── __init__.py
    │   └── consumer.py
    ├── common/
    │   ├── __init__.py
    │   ├── db.py                     # pgBouncer pool
    │   ├── config.py
    │   └── grpc_server.py
    ├── proto/                        # Generated dari protobuf
    ├── server.py
    ├── requirements.txt
    ├── Dockerfile
    └── .env.example
```

### infra/

```
infra/
├── docker-compose.yml                # Deployment utama (Docker Compose)
├── postgres/
│   └── init.sql                      # Init script (create databases)
├── mongodb/
│   └── init.js
├── rabbitmq/
│   └── definitions.json              # Exchange + queue setup
└── gateway/                          # GraphQL gateway (Rust)
```

### protobuf/

```
protobuf/
├── buf.yaml
├── buf.gen.yaml
├── common/
│   └── common.proto                  # Timestamp, Pagination, Empty, Error
├── twitter/
│   ├── twitter.proto                 # Tweet message
│   └── service.proto                 # TwitterService gRPC
├── user/
│   ├── user.proto                    # User message
│   └── service.proto                 # UserService + AuthService gRPC
├── notification/
│   ├── notification.proto
│   └── service.proto
├── classification/
│   ├── classification.proto
│   └── service.proto
├── clustering/                       # — future
│   ├── clustering.proto
│   └── service.proto
├── nlp/                              # — future
│   ├── nlp.proto
│   └── service.proto
└── blockchain/                       # — future, ?
    ├── blockchain.proto
    └── service.proto
```
