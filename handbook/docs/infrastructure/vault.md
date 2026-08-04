# Vault

**HashiCorp Vault** for secret management.

## Flow Secret Resolution

```mermaid
flowchart LR
    A[Service starts] --> B{Env var set?}
    B -->|Ya| C[Pakai env var]
    B -->|No| D{Read from Vault}
    D -->|Sukses| E[Pakai secret Vault]
    D -->|Gagal| F[Pakai default value]
```

Contoh di Rust (Twitter Service):

```rust
mongo_uri: env("MONGO_URI")
    .or_else(|| read_secret("ecoguard/db", "mongo-twitter-uri"))
    .unwrap_or("mongodb://localhost:27017")
```

## Konfigurasi

```yaml
vault:
  image: hashicorp/vault:1.18
  container_name: ecoguard-vault
  ports: ["8200:8200"]
  cap_add: [IPC_LOCK]
  environment:
    VAULT_DEV_ROOT_TOKEN_ID: "root"
```

## Services Using Vault

| Service | Secret Path |
|---------|-------------|
| Twitter Service | `ecoguard/db/mongo-twitter-uri`, `ecoguard/db/rabbitmq-uri` |
| User Auth Service | `ecoguard/db/postgres-uri` |
| Notification Service | `ecoguard/db/postgres-notif-uri` |
| Asset Service | `ecoguard/imagekit/api-key` |

## CLI

```bash
# Masuk ke container
docker compose exec vault sh

# Baca secret
vault kv get ecoguard/db/mongo-twitter-uri

# Tulis secret
vault kv put ecoguard/db/mongo-twitter-uri value=mongodb://user:pass@host:27017
```

> ⚠️ **Dev mode**: root token `root`, data is lost when container restarts.
