# Docker

Ecoguard menggunakan **Docker Compose** untuk development lokal dan **Docker** sebagai unit deployment.

## Docker Compose (Development)

Semua service didefinisikan di `infra/docker-compose.yml`.

### Start Semua Service

```bash
cd infra
docker compose up -d
```

### Start Service Tertentu

```bash
docker compose up classification-service -d
docker compose up gateway -d
```

### Build Ulang Service

```bash
docker compose build classification-service
docker compose up -d classification-service
```

### Lihat Logs

```bash
docker compose logs -f gateway
docker compose logs -f classification-service
```

### Stop

```bash
docker compose down
docker compose down -v   # + hapus volumes (data hilang)
```

## Struktur Dockerfiles

Setiap service punya `Dockerfile` sendiri:

```
backend/classification-service/Dockerfile
backend/user-auth-service/Dockerfile
backend/twitter-service/Dockerfile
...
infra/gateway/Dockerfile
```

## Environment Variables

Tiap service dikonfigurasi via environment variables di `docker-compose.yml`:

```yaml
classification-service:
  environment:
    GRPC_PORT: "50053"
    FLASK_PORT: "8083"
    MODEL_PATH: "models/model.onnx"
    LABELS_PATH: "models/labels.json"
    RABBITMQ_URI: "amqp://guest:guest@rabbitmq:5672"
```

## Network

Semua service terhubung dalam satu bridge network `ecoguard`:

```yaml
networks:
  ecoguard:
    driver: bridge
```

Service berkomunikasi via **container name** sebagai hostname:

```
classification-service:50053   → gRPC
rabbitmq:5672                   → AMQP
postgres-user:5432              → PostgreSQL
```
