SHELL   := /bin/bash
COMPOSE := docker compose
NETWORK := $(or $(API_NETWORK),cartapi_default)
FRONT   := http://localhost:$(or $(PORT),8081)

.DEFAULT_GOAL := help
.PHONY: help env up down logs sh install dev build test format

help:
	@echo ""
	@echo -e "  DOCKER  (no necesitas Node instalado)"
	@echo -e "    \033[36menv\033[0m          crea .env desde .env.example (opcional)"
	@echo -e "    \033[36mup\033[0m           construye y arranca el front"
	@echo -e "    \033[36mdown\033[0m         lo para"
	@echo -e "    \033[36mlogs\033[0m         logs de nginx"
	@echo -e "    \033[36msh\033[0m           shell dentro del contenedor"
	@echo ""
	@echo -e "  LOCAL   (necesitas Node 24 y pnpm 11)"
	@echo -e "    \033[36minstall\033[0m      instala dependencias"
	@echo -e "    \033[36mdev\033[0m          servidor de desarrollo (http://localhost:4200)"
	@echo -e "    \033[36mbuild\033[0m        compila a dist/"
	@echo -e "    \033[36mtest\033[0m         tests con Vitest"
	@echo -e "    \033[36mformat\033[0m       formatea con Prettier"
	@echo ""

env:
	@test -f .env && echo ".env ya existe, no lo toco" \
	  || { cp .env.example .env; echo "Creado .env"; }

up:
	@docker network inspect $(NETWORK) >/dev/null 2>&1 \
	  || { echo "No existe la red '$(NETWORK)'. Levanta antes CartAPI: make up en su repo."; exit 1; }
	$(COMPOSE) up -d --build
	@echo "Listo  ->  $(FRONT)"

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f web

sh:
	$(COMPOSE) exec web sh

install:
	pnpm install

dev:
	pnpm start

build:
	pnpm build

test:
	pnpm test

format:
	pnpm prettier --write .
