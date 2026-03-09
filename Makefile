.PHONY: help build up down logs shell test clean deploy backup restore

# Colors for help
BLUE:=\033[36m
RESET:=\033[0m

help: ## Show this help message
	@printf "${BLUE}FormalProof Labs - Make Commands${RESET}\n"
	@printf "Usage: make [target]\n\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${BLUE}%-20s${RESET} %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker-compose -f docker/docker-compose.yml build

up: ## Start all services
	docker-compose -f docker/docker-compose.yml up -d

down: ## Stop all services
	docker-compose -f docker/docker-compose.yml down

logs: ## View service logs
	docker-compose -f docker/docker-compose.yml logs -f

ps: ## List running services
	docker-compose -f docker/docker-compose.yml ps

shell-backend: ## Open shell in backend container
	docker-compose -f docker/docker-compose.yml exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker-compose -f docker/docker-compose.yml exec frontend /bin/sh

shell-db: ## Open PostgreSQL shell
	docker-compose -f docker/docker-compose.yml exec postgres psql -U formalproof_user formalproof

shell-redis: ## Open Redis CLI
	docker-compose -f docker/docker-compose.yml exec redis redis-cli

test: ## Run tests
	docker-compose -f docker/docker-compose.yml run --rm backend pytest
	docker-compose -f docker/docker-compose.yml run --rm frontend npm test

test-backend: ## Run backend tests only
	docker-compose -f docker/docker-compose.yml run --rm backend pytest

test-frontend: ## Run frontend tests only
	docker-compose -f docker/docker-compose.yml run --rm frontend npm test

clean: ## Clean up Docker resources
	docker-compose -f docker/docker-compose.yml down -v
	docker system prune -f

deploy: ## Deploy to production
	@echo "Deploying FormalProof Labs..."
	@chmod +x deployment/deploy.sh
	@./deployment/deploy.sh

backup: ## Backup database
	@echo "Creating database backup..."
	@docker-compose -f docker/docker-compose.yml exec -T postgres pg_dump -U formalproof_user formalproof > backup_$$(date +%Y%m%d_%H%M%S).sql

restore: ## Restore database from backup
	@echo "Enter backup filename: "; read filename; \
	docker-compose -f docker/docker-compose.yml exec -T postgres psql -U formalproof_user formalproof < $$filename

migrate: ## Run database migrations
	docker-compose -f docker/docker-compose.yml run --rm backend python -c "from app import app, db; app.app_context().push(); db.create_all()"

reset-db: ## Reset database (WARNING: deletes all data)
	@echo "WARNING: This will delete all data. Continue? (y/n) " && read ans && [ $${ans:-N} = y ] || exit 1
	docker-compose -f docker/docker-compose.yml down -v
	docker-compose -f docker/docker-compose.yml up -d postgres
	@sleep 10
	make migrate

init: ## Initialize project (first time setup)
	@echo "Initializing FormalProof Labs..."
	@cp .env.example .env
	@echo "Please edit .env file with your configuration"
	@echo "Then run: make up"

ssl-certs: ## Generate self-signed SSL certificates for development
	@mkdir -p ssl
	@openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout ssl/key.pem \
		-out ssl/cert.pem \
		-subj "/C=US/ST=State/L=City/O=FormalProof Labs/CN=localhost"
	@echo "SSL certificates generated in ssl/ directory"