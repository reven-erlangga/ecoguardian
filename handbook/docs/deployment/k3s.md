# K3s (Kubernetes)

K3s manifests available at `infra/k3s/`.

## Deploy

```bash
cd infra/k3s
kubectl apply -f namespace.yaml
kubectl apply -f secrets/
kubectl apply -f postgres-user.yaml postgres-notif.yaml mongodb-twitter.yaml rabbitmq.yaml
kubectl apply -f classification-service.yaml user-auth-service.yaml twitter-service.yaml
kubectl apply -f gateway.yaml
```

## Resources

| Type | Used For |
|------|----------|
| **StatefulSet** | PostgreSQL, MongoDB |
| **Deployment** | Backend services, gateway |
| **Service** | ClusterIP internal communication |
| **Ingress** | External HTTP/HTTPS |
| **ConfigMap** | pgBouncer config |
| **PVC** | Database persistence |
| **Secret** | DB credentials |
