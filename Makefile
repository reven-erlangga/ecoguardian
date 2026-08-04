# Ecoguard — Makefile
# ============================================
# Development (Docker) + K3s deployment

.PHONY: help dev up down logs restart build \
        k8s k8s-down rebuild tunnel \
        research handbook handbook-dev

# ─── Help ────────────────────────────────────────────────
help:
	@echo "╔══════════════════════════════════════════════╗"
	@echo "║           ECOGUARD — Makefile               ║"
	@echo "╠══════════════════════════════════════════════╣"
	@echo "║                                            ║"
	@echo "║  DEVELOPMENT (Docker Compose)               ║"
	@echo "║  make dev        → Start all services      ║"
	@echo "║  make up <svc>   → Start single service    ║"
	@echo "║  make down       → Stop all                 ║"
	@echo "║  make logs <svc> → View logs                ║"
		@echo "║  make build      → Rebuild all images       ║"
		@echo "║  make rebuild    → Force rebuild (no cache) ║"
		@echo "║                                            ║"
		@echo "║  KUBERNETES                                ║"
		@echo "║  make k8s       → Deploy all to K3s         ║"
		@echo "║  make k8s-down  → Delete all from K3s       ║"
		@echo "║  make tunnel    → Port-forward ke localhost  ║"
		@echo "║                                            ║"
	@echo "║  RESEARCH                                   ║"
	@echo "║  make research TARGET=scrap    → Generate   ║"
	@echo "║  make research TARGET=cluster  → DBSCAN     ║"
	@echo "║  make research TARGET=train    → Train ONNX ║"
	@echo "║  make research TARGET=split    → Split ds   ║"
	@echo "║                                            ║"
	@echo "║  HANDBOOK                                   ║"
	@echo "║  make handbook    → Build static site       ║"
	@echo "║  make handbook-dev→ Start dev server        ║"
	@echo "╚══════════════════════════════════════════════╝"

# ─── Docker Compose ──────────────────────────────────────
dev:
	docker compose -f infra/docker-compose.yml up -d

up:
	docker compose -f infra/docker-compose.yml up -d $(filter-out $@,$(MAKECMDGOALS))

down:
	docker compose -f infra/docker-compose.yml down

logs:
	docker compose -f infra/docker-compose.yml logs -f $(filter-out $@,$(MAKECMDGOALS))

restart:
	docker compose -f infra/docker-compose.yml restart $(filter-out $@,$(MAKECMDGOALS))

build:
	docker compose -f infra/docker-compose.yml build $(filter-out $@,$(MAKECMDGOALS))

# ─── Kubernetes ───────────────────────────────────────────
k8s:
	@echo "--- Vault ---"
	kubectl apply -f infra/k3s/vault/vault-namespace.yaml
	kubectl apply -f infra/k3s/vault/vault-config.yaml
	kubectl apply -f infra/k3s/vault/vault-statefulset.yaml
	kubectl apply -f infra/k3s/vault/vault-service.yaml
	kubectl apply -f infra/k3s/vault/db-credentials-secret.yaml
	@echo "--- Infra ---"
	kubectl apply -f infra/k3s/namespace.yaml
	kubectl apply -f infra/k3s/postgres-user.yaml
	kubectl apply -f infra/k3s/postgres-notif.yaml
	kubectl apply -f infra/k3s/mongodb-twitter.yaml
	kubectl apply -f infra/k3s/rabbitmq.yaml
	kubectl apply -f infra/k3s/redis.yaml
	kubectl apply -f infra/k3s/pgbouncer.yaml
	@echo "--- Services ---"
	kubectl apply -f infra/k3s/classification-service.yaml
	kubectl apply -f infra/k3s/user-auth-service.yaml
	kubectl apply -f infra/k3s/twitter-service.yaml
	kubectl apply -f infra/k3s/notification-service.yaml
	kubectl apply -f infra/k3s/nlp-service.yaml
	kubectl apply -f infra/k3s/blockchain-service.yaml
	kubectl apply -f infra/k3s/issue-service.yaml
	kubectl apply -f infra/k3s/gateway.yaml
	kubectl apply -f infra/k3s/frontend.yaml
	kubectl apply -f infra/k3s/handbook.yaml
	@echo "✅ All services deployed to K3s"

# ─── K3s Down ─────────────────────────────────────────────
k8s-down:
	kubectl delete -f infra/k3s/handbook.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/frontend.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/gateway.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/issue-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/blockchain-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/nlp-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/notification-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/twitter-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/user-auth-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/classification-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/redis.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/rabbitmq.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/pgbouncer.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/mongodb-twitter.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/postgres-notif.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/postgres-user.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/namespace.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/vault/db-credentials-secret.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/vault/vault-service.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/vault/vault-statefulset.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/vault/vault-config.yaml 2>/dev/null || true
	kubectl delete -f infra/k3s/vault/vault-namespace.yaml 2>/dev/null || true
	@echo "✅ All services removed from K3s"

# ─── Rebuild (force) ─────────────────────────────────────
rebuild:
	docker compose -f infra/docker-compose.yml down --remove-orphans
	docker compose -f infra/docker-compose.yml build --no-cache
	@echo "✅ All images rebuilt from scratch"

# ─── Port-Forward Tunnel ──────────────────────────────────
tunnel:
	@echo "🌀 Opening tunnels to K3s services..."
	@echo "   Frontend:  http://localhost:4321"
	@echo "   Handbook:  http://localhost:5173"
	@echo "   Gateway:   http://localhost:4000"
	@echo "   Twitter:   http://localhost:8000"
	@echo "Press Ctrl+C to stop"
	kubectl port-forward -n ecoguard service/frontend 4321:4321 --address 0.0.0.0 & \
	kubectl port-forward -n ecoguard service/handbook 5173:80 --address 0.0.0.0 & \
	kubectl port-forward -n ecoguard service/gateway 4000:4000 --address 0.0.0.0 & \
	kubectl port-forward -n ecoguard service/twitter-service 8000:8000 --address 0.0.0.0 & \
	wait

# ─── Research ─────────────────────────────────────────────
research:
ifeq ($(TARGET),scrap)
	cd research/scraping && python app.py --limit 1000
else ifeq ($(TARGET),cluster)
	cp research/scraping/data/dataset.json backend/issue-service/features/clustering/models/tweets.json
	cd backend/issue-service && python -m features.clustering.service
else ifeq ($(TARGET),train)
	cd research/training && python train.py
else ifeq ($(TARGET),split)
	cd research/training && python split.py
else
	@echo "╔══════════════════════════════════════════════╗"
	@echo "║  make research TARGET=<target>              ║"
	@echo "╠══════════════════════════════════════════════╣"
	@echo "║  scrap   → Generate 5000 reports            ║"
	@echo "║  cluster → Run DBSCAN clustering            ║"
	@echo "║  train   → Train model → ONNX               ║"
	@echo "║  split   → Split dataset 80/10/10           ║"
	@echo "╚══════════════════════════════════════════════╝"
endif

# ─── Handbook ─────────────────────────────────────────────
handbook:
	cd handbook && npm run docs:build

handbook-dev:
	cd handbook && npm run docs:dev
