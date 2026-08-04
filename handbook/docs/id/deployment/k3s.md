# K3s (Kubernetes)

Ecoguard siap di-deploy ke **K3s** — lightweight Kubernetes. Manifest sudah tersedia di `infra/k3s/`.

## Prasyarat

- K3s cluster (atau kind/minikube untuk testing lokal)
- `kubectl` terkonfigurasi

## Struktur Manifests

```
infra/k3s/
├── namespace.yaml
├── postgres-user.yaml
├── postgres-notif.yaml
├── mongodb-twitter.yaml
├── rabbitmq.yaml
├── pgbouncer.yaml
├── pgbouncer/
│   └── pgbouncer.ini
├── gateway.yaml
├── twitter-service.yaml
├── classification-service.yaml
├── user-auth-service.yaml
├── notification-service.yaml
└── secrets/
    └── db-credentials.yaml
```

## Deploy

```bash
cd infra/k3s

# Buat namespace
kubectl apply -f namespace.yaml

# Deploy secrets
kubectl apply -f secrets/

# Deploy infrastructure
kubectl apply -f postgres-user.yaml
kubectl apply -f postgres-notif.yaml
kubectl apply -f mongodb-twitter.yaml
kubectl apply -f rabbitmq.yaml

# Deploy services
kubectl apply -f classification-service.yaml
kubectl apply -f user-auth-service.yaml
kubectl apply -f twitter-service.yaml
kubectl apply -f notification-service.yaml
kubectl apply -f gateway.yaml
```

## Architecture K3s

```
┌─────────────────────────────────────────┐
│           Ingress (HTTP/HTTPS)           │
├─────────────────────────────────────────┤
│              Gateway Service             │
│              NodePort :4000              │
├────────┬────────┬──────────┬────────────┤
│ PVC    │ PVC    │   PVC    │    PVC     │
│ Postgres│Postgres│ MongoDB  │  RabbitMQ  │
│ (user) │ (notif)│          │            │
└────────┴────────┴──────────┴────────────┘
```

## Resource Types

| Resource | Digunakan Untuk |
|----------|----------------|
| **StatefulSet** | PostgreSQL, MongoDB (butuh persistent storage) |
| **Deployment** | Backend services, gateway |
| **Service** | Internal communication (ClusterIP) |
| **Ingress** | External access (HTTP/HTTPS) |
| **ConfigMap** | pgBouncer config |
| **PersistentVolumeClaim** | Database storage |
| **Secret** | Database credentials |
