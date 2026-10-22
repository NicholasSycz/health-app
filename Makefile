# Health App — developer commands.
#
#   make dev     start everything (Postgres, migrations, API, web) in one command
#   make help    list every target
#
# `make dev` is idempotent: it starts only what isn't already running and
# creates only what doesn't already exist, so it is safe to re-run.

SHELL := /bin/bash
.DEFAULT_GOAL := help

BACKEND  := backend
FRONTEND := frontend
VENV     := $(BACKEND)/.venv
PY       := $(VENV)/bin/python
PIP      := $(VENV)/bin/pip
UVICORN  := $(VENV)/bin/uvicorn
ALEMBIC  := $(VENV)/bin/alembic

DB_NAME  := health_app
API_PORT := 8000
WEB_PORT := 5173

# Prefix each line with its source. awk + fflush() keeps output line-buffered;
# `sed` block-buffers off a tty and would swallow both servers' logs.
TAGGER = awk -v tag=$(1) '{ printf "[%s] %s\n", tag, $$0; fflush() }'

# Prefer the cluster matching the linked psql; fall back to any installed one.
PG_MAJOR := $(shell psql --version 2>/dev/null | sed -E 's/.* ([0-9]+)\..*/\1/')
PGDATA   ?= $(shell ls -d /opt/homebrew/var/postgresql@$(PG_MAJOR) 2>/dev/null || ls -d /opt/homebrew/var/postgresql@* 2>/dev/null | head -1)
PGLOG    ?= /opt/homebrew/var/log/postgresql@$(PG_MAJOR).log

.PHONY: help dev setup venv deps env db db-start db-stop db-create migrate \
        migration backend frontend build check test reset-db clean

help: ## Show this help
	@echo "Health App — make targets"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Quick start:  make dev"

# ---------------------------------------------------------------- one command

dev: setup db migrate ## Start Postgres, run migrations, then the API and web app
	@echo
	@echo "  API  →  http://localhost:$(API_PORT)   (docs at /docs)"
	@echo "  Web  →  http://localhost:$(WEB_PORT)"
	@echo "  Ctrl-C stops both."
	@echo
	@trap 'kill 0' INT TERM; \
	  ( cd $(BACKEND) && ../$(UVICORN) app.main:app --reload --port $(API_PORT) 2>&1 | $(call TAGGER,api) ) & \
	  ( cd $(FRONTEND) && npm run dev -- --port $(WEB_PORT) 2>&1 | $(call TAGGER,web) ) & \
	  wait

# ------------------------------------------------------------------- setup

setup: venv deps env ## Create the venv, install dependencies, write .env files

venv:
	@test -x $(PY) || { echo "→ creating virtualenv"; python3 -m venv $(VENV); }

deps:
	@$(PY) -c "import fastapi, sqlalchemy, alembic" 2>/dev/null \
	  || { echo "→ installing backend dependencies"; $(PIP) install -q -r $(BACKEND)/requirements.txt; }
	@test -d $(FRONTEND)/node_modules \
	  || { echo "→ installing frontend dependencies"; cd $(FRONTEND) && npm install; }

env:
	@test -f $(BACKEND)/.env || { \
	  echo "→ creating $(BACKEND)/.env with a random SECRET_KEY"; \
	  cp $(BACKEND)/.env.example $(BACKEND)/.env; \
	  key=$$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))'); \
	  python3 -c "import pathlib,sys; p=pathlib.Path('$(BACKEND)/.env'); p.write_text(p.read_text().replace('change-me-to-a-random-secret', sys.argv[1]))" "$$key"; \
	}
	@test -f $(FRONTEND)/.env || { \
	  echo "→ creating $(FRONTEND)/.env"; \
	  cp $(FRONTEND)/.env.example $(FRONTEND)/.env; \
	}

# ---------------------------------------------------------------- database

db: db-start db-create ## Ensure Postgres is running and the database exists

db-start:
	@pg_isready -q || { \
	  test -n "$(PGDATA)" || { echo "No Postgres cluster found. Try: brew install postgresql@16"; exit 1; }; \
	  echo "→ starting Postgres ($(PGDATA))"; \
	  pg_ctl -D "$(PGDATA)" -l "$(PGLOG)" start >/dev/null; \
	  for i in $$(seq 1 20); do pg_isready -q && break; sleep 0.25; done; \
	  pg_isready -q || { echo "Postgres failed to start; see $(PGLOG)"; exit 1; }; \
	}

db-stop: ## Stop the local Postgres server
	@pg_isready -q && { echo "→ stopping Postgres"; pg_ctl -D "$(PGDATA)" stop >/dev/null; } || echo "Postgres is not running"

db-create:
	@psql -lqt | cut -d'|' -f1 | grep -qw $(DB_NAME) \
	  || { echo "→ creating database $(DB_NAME)"; createdb $(DB_NAME); }

migrate: ## Apply all pending migrations
	@cd $(BACKEND) && ../$(ALEMBIC) upgrade head

migration: ## Autogenerate a migration: make migration name="add widgets"
	@test -n "$(name)" || { echo 'Usage: make migration name="what changed"'; exit 1; }
	@cd $(BACKEND) && ../$(ALEMBIC) revision --autogenerate -m "$(name)"

reset-db: ## DESTRUCTIVE — drop the database and rebuild it from migrations
	@read -p "Drop and recreate '$(DB_NAME)'? All data will be lost. [y/N] " ok; \
	  [[ $$ok == [yY] ]] || { echo "aborted"; exit 1; }
	@dropdb --if-exists $(DB_NAME) && createdb $(DB_NAME)
	@$(MAKE) --no-print-directory migrate
	@echo "→ database reset"

# ----------------------------------------------------- individual processes

backend: setup db migrate ## Run only the API
	@cd $(BACKEND) && ../$(UVICORN) app.main:app --reload --port $(API_PORT)

frontend: setup ## Run only the web app
	@cd $(FRONTEND) && npm run dev -- --port $(WEB_PORT)

# ------------------------------------------------------------------ quality

check: ## Typecheck and lint the frontend
	@cd $(FRONTEND) && npx tsc --noEmit && npx eslint src --max-warnings=0
	@echo "→ frontend clean"

test: ## Run the backend test suite
	@cd $(BACKEND) && ../$(VENV)/bin/pytest -q

build: ## Production build of the web app
	@cd $(FRONTEND) && npm run build

clean: ## Remove build artefacts and caches
	@rm -rf $(FRONTEND)/dist $(FRONTEND)/.tsbuildinfo
	@find $(BACKEND)/app -name __pycache__ -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "→ cleaned"
