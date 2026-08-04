# Vault — Infra Setup

## Versions

| Component | Version |
|-----------|---------|
| Vault     | 1.19.1  |
| Storage   | Integrated Raft |

## Deploy

```bash
kubectl apply -f infra/k3s/vault/vault-namespace.yaml
kubectl apply -f infra/k3s/vault/vault-config.yaml
kubectl apply -f infra/k3s/vault/vault-service.yaml
kubectl apply -f infra/k3s/vault/vault-statefulset.yaml
```

## Bootstrap (one-time)

### 1. Init
```bash
kubectl -n vault exec vault-0 -- vault operator init -key-shares=1 -key-threshold=1
# Simpan Unseal Key + Root Token
```

### 2. Unseal
```bash
kubectl -n vault exec vault-0 -- vault operator unseal <UNSEAL_KEY>
```

### 3. Login
```bash
kubectl -n vault exec vault-0 -- vault login <ROOT_TOKEN>
```

### 4. Enable engines
```bash
kubectl -n vault exec vault-0 -- vault secrets enable -path=secret kv-v2
kubectl -n vault exec vault-0 -- vault auth enable kubernetes
```

### 5. K8s auth config
```bash
kubectl -n vault exec vault-0 -- sh -c "vault write auth/kubernetes/config \
  kubernetes_host='https://kubernetes.default.svc' \
  token_reviewer_jwt=\"\$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)\""
```

### 6. Policy + role
```bash
kubectl -n vault exec vault-0 -- vault policy write ecoguard-read - <<EOF
path "secret/data/ecoguard/*" {
  capabilities = ["read"]
}
EOF

kubectl -n vault exec vault-0 -- vault write auth/kubernetes/role/ecoguard \
  bound_service_account_names=default \
  bound_service_account_namespaces=ecoguard \
  policies=ecoguard-read \
  ttl=1h
```

### 7. Write secrets
```bash
kubectl -n vault exec vault-0 -- vault kv put secret/ecoguard/db \
  postgres-user-dsn="postgresql://ecoguard:ecoguard123@postgres-user:5432/ecoguard_user" \
  postgres-notif-dsn="postgresql://ecoguard:ecoguard123@postgres-notif:5432/ecoguard_notif" \
  mongo-twitter-uri="mongodb://mongo-twitter:27017/ecoguard_twitter" \
  rabbitmq-uri="amqp://guest:guest@rabbitmq:5672" \
  jwt-secret="<real-jwt-secret>"

kubectl -n vault exec vault-0 -- vault kv patch secret/ecoguard/db \
  imagekit-public-key="your-imagekit-public-key" \
  imagekit-private-key="your-imagekit-private-key" \
  imagekit-url-endpoint="https://ik.imagekit.io/your-id"
```

### 8. Apply K8s Secret
```bash
kubectl apply -f infra/k3s/vault/db-credentials-secret.yaml
```

## Verifikasi
```bash
kubectl -n ecoguard get secret db-credentials
kubectl -n vault exec vault-0 -- vault kv get secret/ecoguard/db
```

## Operasi Harian (CLI)

### Login (sebelum operasi apapun)
```bash
kubectl -n vault exec vault-0 -- vault login <ROOT_TOKEN>
```

### Lihat semua secret
```bash
kubectl -n vault exec vault-0 -- vault kv list secret/ecoguard
```

### Lihat isi secret
```bash
kubectl -n vault exec vault-0 -- vault kv get secret/ecoguard/db
```

### Tambah key baru (tanpa overwrite yang lama)
```bash
kubectl -n vault exec vault-0 -- vault kv patch secret/ecoguard/db \
  NAMA_KEY="nilainya"
```

### Update semua sekaligus (overwrite seluruh secret)
```bash
kubectl -n vault exec vault-0 -- vault kv put secret/ecoguard/db \
  key1="value1" \
  key2="value2"
# ⚠️  HATI-HATI: ini replace semua key yang ada
```

### Hapus satu key
```bash
kubectl -n vault exec vault-0 -- vault kv patch secret/ecoguard/db \
  NAMA_KEY=""
```

### Sinkron ke K8s Secret
Setelah update vault, update juga `db-credentials-secret.yaml` lalu apply:
```bash
kubectl apply -f infra/k3s/vault/db-credentials-secret.yaml
```

## Vault Secrets Operator (future, Helm)

VSO 1.4.1+ hanya distribusi via Helm. Kalau butuh auto-sync/rotation:
```bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault-secrets-operator hashicorp/vault-secrets-operator \
  --namespace vault --version 1.4.1
```
