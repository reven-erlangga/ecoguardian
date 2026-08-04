# PostgreSQL

Relational database for Ecoguard services.

## Flow Connection

```mermaid
flowchart LR
    subgraph Services["SERVICES"]
        UA[User & Auth Service]
        NO[Notification Service]
        NL[NLP Service]
    end

    subgraph Pool["CONNECTION POOL"]
        PB[pgBouncer<br/>:6432]
    end

    subgraph DB["DATABASES"]
        PG1[(PostgreSQL<br/>:5432<br/>ecoguard_user)]
        PG2[(PostgreSQL<br/>:5433<br/>ecoguard_notif)]
    end

    UA --> PB
    NO --> PB
    NL --> PG1
    PB --> PG1
    PB --> PG2
```

## Instances

| Container | Port | Database | Service |
|-----------|------|----------|---------|
| `postgres-user` | 5432 | `ecoguard_user` | User & Auth |
| `postgres-notif` | 5433 | `ecoguard_notif` | Notification |

## Konfigurasi

```yaml
postgres-user:
  image: postgres:16-alpine
  ports: ["5432:5432"]
  environment:
    POSTGRES_DB: ecoguard_user
    POSTGRES_USER: ecoguard
    POSTGRES_PASSWORD: ecoguard_dev
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ecoguard -d ecoguard_user"]
```

## Cara Koneksi

Service konek via **pgBouncer**, bukan langsung:

```python
# ✅ Via pgBouncer
dsn = "postgresql://ecoguard:ecoguard_dev@pgbouncer:6432/ecoguard_user"

# ❌ Langsung ke PostgreSQL
dsn = "postgresql://ecoguard:ecoguard_dev@postgres-user:5432/ecoguard_user"
```
