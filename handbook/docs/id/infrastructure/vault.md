# Vault

HashiCorp Vault untuk secret management.

## Flow

```mermaid
flowchart LR
    A[Service mulai] --> B{Env var?}
    B -->|Ya| C[Pakai env var]
    B -->|Tidak| D{Baca Vault}
    D -->|Sukses| E[Pakai secret]
    D -->|Gagal| F[Default value]
```

```rust
mongo_uri: env("MONGO_URI")
    .or_else(|| read_secret("ecoguard/db", "mongo-twitter-uri"))
    .unwrap_or("mongodb://localhost:27017")
```

> ⚠️ Dev mode — data hilang saat restart.
