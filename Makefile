# Ecoguard — Makefile
# ============================================
# Development (Docker Compose)

.PHONY: help dev up down logs restart build \
        rebuild research handbook handbook-dev

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

# ─── Rebuild (force) ─────────────────────────────────────
rebuild:
	docker compose -f infra/docker-compose.yml down --remove-orphans
	docker compose -f infra/docker-compose.yml build --no-cache
	@echo "✅ All images rebuilt from scratch"

# ─── Research ─────────────────────────────────────────────
research:
ifeq ($(TARGET),scrap)
	cd research/scraping && python app.py --limit 1000
else ifeq ($(TARGET),cluster)
	cp research/scraping/data/dataset.json backend/issue-service/features/clustering/models/tweets.json
	cd backend/issue-service && python -m features.clustering.service
else ifeq ($(TARGET),train)
	cd research/classification && python train.py
else ifeq ($(TARGET),split)
	cd research/classification && python split.py
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
