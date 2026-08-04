# Docker Compose Reference

Referensi lengkap untuk menggunakan Docker Compose.

## Service Definitions

File: `infra/docker-compose.yml`

### Infrastructure Services

```yaml
services:
  postgres-user:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ecoguard -d ecoguard_user"]

  postgres-notif:
    image: postgres:16-alpine
    ports: ["5433:5432"]

  mongodb:
    image: mongo:7
    ports: ["27017:27017"]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  vault:
    image: hashicorp/vault:1.18
    ports: ["8200:8200"]
```

### Backend Services

```yaml
  classification-service:
    build: ../backend/classification-service
    ports: ["50053:50053", "8083:8083"]

  gateway:
    build:
      context: ..
      dockerfile: infra/gateway/Dockerfile
    ports: ["4000:4000"]
    depends_on: [all backend services]
```

## Useful Commands

```bash
# Build + Start semua
docker compose up -d --build

# Restart service tertentu
docker compose restart classification-service

# Lihat logs real-time
docker compose logs -f classification-service gateway

# Execute command dalam container
docker compose exec mongodb mongosh

# Hapus semua containers + volumes
docker compose down -v

# Build tanpa cache
docker compose build --no-cache classification-service
```
