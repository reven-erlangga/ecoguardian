# pgBouncer

Lightweight connection pooler for PostgreSQL.

## Function

Manages database connections to reduce load on PostgreSQL from multiple simultaneous connections.

```mermaid
graph LR
    UA[User Auth Service] --> PB[pgBouncer :6432]
    NO[Notification Service] --> PB
    PB --> PG1[PostgreSQL :5432<br/>ecoguard_user]
    PB --> PG2[PostgreSQL :5433<br/>ecoguard_notif]
```

## Konfigurasi

```yaml
pgbouncer:
  image: edoburu/pgbouncer:latest
  ports: ["6432:6432"]
  environment:
    DB_USER: ecoguard
    DB_PASSWORD: ecoguard_dev
    DB_HOST: postgres-user
    POOL_MODE: transaction
    DEFAULT_POOL_SIZE: 20
  depends_on:
    postgres-user: { condition: service_healthy }
    postgres-notif: { condition: service_healthy }
```

## Parameter

| Parameter | Value | Fungsi |
|-----------|-------|--------|
| `POOL_MODE` | `transaction` | Koneksi dilepas setelah transaksi selesai |
| `DEFAULT_POOL_SIZE` | `20` | Maksimal 20 koneksi simultan |

## Cara Koneksi

Services do not connect directly to PostgreSQL, but through pgBouncer:

```python
# ✅ Benar — via pgBouncer
dsn = "postgresql://ecoguard:ecoguard_dev@pgbouncer:6432/ecoguard_user"

# ❌ Salah — langsung ke PostgreSQL (skip pool)
dsn = "postgresql://ecoguard:ecoguard_dev@postgres-user:5432/ecoguard_user"
```
