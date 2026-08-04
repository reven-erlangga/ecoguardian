# Docker

All services containerized with Docker. Docker Compose for local development.

## Compose

`infra/docker-compose.yml` defines all services.

```bash
cd infra
docker compose up -d                 # Start all
docker compose up classification-service -d  # Single service
docker compose logs -f gateway       # View logs
docker compose down                  # Stop
docker compose down -v               # Stop + remove volumes
```

## Dockerfiles

Each service has its own `Dockerfile`:
- `backend/*/Dockerfile` — Python/Rust services
- `infra/gateway/Dockerfile` — GraphQL gateway

## Network

All services share bridge network `ecoguard`. Communication via container names:

```
classification-service:50053
rabbitmq:5672
postgres-user:5432
```
