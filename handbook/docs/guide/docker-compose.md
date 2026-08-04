# Docker Compose Reference

## Services

```yaml
services:
  postgres-user:
    image: postgres:16-alpine
    ports: ["5432:5432"]

  postgres-notif:
    image: postgres:16-alpine
    ports: ["5433:5432"]

  mongodb:
    image: mongo:7
    ports: ["27017:27017"]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]

  classification-service:
    build: ../backend/classification-service
    ports: ["50053:50053", "8083:8083"]

  gateway:
    build:
      context: ..
      dockerfile: infra/gateway/Dockerfile
    ports: ["4000:4000"]
```

## Useful Commands

```bash
# Build + start all
docker compose up -d --build

# Rebuild and restart single service
docker compose build classification-service
docker compose up -d classification-service

# View logs
docker compose logs -f classification-service gateway

# Execute command in container
docker compose exec mongodb mongosh

# Remove everything including volumes
docker compose down -v
```
