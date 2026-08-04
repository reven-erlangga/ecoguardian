# Infrastructure Overview

Ecoguard menggunakan beberapa infrastruktur pendukung untuk menjalankan backend services.

```mermaid
graph TB
    subgraph Services["BACKEND SERVICES"]
        UA[User Auth]
        NO[Notification]
        NL[NLP]
        TW[Twitter]
        BC[Blockchain]
        IS[Issue]
        CL[Classification]
    end

    subgraph Infra["INFRASTRUCTURE"]
        PG[(PostgreSQL)]
        MG[(MongoDB)]
        RQ[(RabbitMQ)]
        RD[(Redis)]
        PB[pgBouncer]
        VT[Vault]
    end

    UA --> PB --> PG
    NO --> PB --> PG
    NL --> PG
    TW --> MG
    BC --> MG
    IS --> MG
    TW -.-> RQ
    CL -.-> RQ
    IS -.-> RQ
    NL --> RD
    UA -.-> VT
    NO -.-> VT
    TW -.-> VT
```

## Components

| Component | Port | Image | Digunakan Oleh |
|-----------|------|-------|---------|
| [PostgreSQL](/id/infrastructure/postgresql) | 5432 / 5433 | `postgres:16-alpine` | User Auth, Notification, NLP |
| [pgBouncer](/id/infrastructure/pgbouncer) | 6432 | `edoburu/pgbouncer` | Connection pooling |
| [MongoDB](/id/infrastructure/mongodb) | 27017 | `mongo:7` | Twitter, Issue, Blockchain |
| [RabbitMQ](/id/infrastructure/rabbitmq) | 5672 / 15672 | `rabbitmq:3-management-alpine` | Event bus |
| [Redis](/id/infrastructure/redis) | 6379 | `redis:7-alpine` | NLP cache |
| [Vault](/id/infrastructure/vault) | 8200 | `hashicorp/vault:1.18` | Secret management |

## Quick Start

Semua infrastruktur jalan via Docker Compose:

```bash
cd infra
docker compose up -d
```
