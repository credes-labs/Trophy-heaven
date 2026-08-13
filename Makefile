# Legacy Crafts local development helpers.
# Prefer host services on this VM (Postgres/Redis already installed + Meilisearch binary).
# On a Docker-capable machine: `make docker-up` / `make docker-apps`.

.PHONY: up down migrate seed reindex schemas typecheck test docker-up docker-down docker-apps help

help:
	@echo "Targets:"
	@echo "  make up           Start Meilisearch + Medusa + storefront (tmux)"
	@echo "  make down         Stop tmux app sessions"
	@echo "  make migrate      Run Medusa DB migrations"
	@echo "  make seed         Idempotent catalog/fulfillment/inventory seed"
	@echo "  make reindex      Rebuild Meilisearch product index"
	@echo "  make schemas      Build @legacy-crafts/schemas"
	@echo "  make typecheck    Typecheck workspace packages"
	@echo "  make test         Run unit tests"
	@echo "  make docker-up    docker compose up -d (backing services)"
	@echo "  make docker-apps  docker compose --profile apps up -d (full stack)"

up:
	./scripts/dev-up.sh

down:
	./scripts/dev-down.sh

migrate:
	cd apps/medusa && npx medusa db:migrate

seed:
	cd apps/medusa && npx medusa exec ./src/scripts/seed.ts

reindex:
	./scripts/reindex-search.sh

schemas:
	pnpm --filter @legacy-crafts/schemas build

typecheck:
	pnpm -r typecheck

test:
	pnpm -r test

docker-up:
	docker compose up -d

docker-down:
	docker compose --profile apps down

docker-apps:
	docker compose --profile apps up -d --build
