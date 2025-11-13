# 🚀 Quick Start - PomoTask PWA

## ⚡ Iniciar Rapidamente

### Opção 1: Desenvolvimento Local (Recomendado)

```bash
# Instalar tudo
npm run install:all

# Rodar em paralelo (API + PWA)
npm run dev
```

Acesse: http://localhost:8080

### Opção 2: Docker Compose

```bash
# Build e iniciar
docker-compose up --build

# Ou em background
docker-compose up -d
```

Acesse: http://localhost:8080

## 📋 Comandos Úteis

### Desenvolvimento

```bash
# API apenas
npm run dev:api

# PWA apenas
npm run dev:web

# Ambos em paralelo
npm run dev
```

### Build

```bash
# Build de tudo
npm run build

# Build da API
npm run build:api

# Build do PWA
npm run build:web

# Build da extensão original
npm run build:extension
```

### Testes

```bash
# Todos os testes
npm test

# E2E apenas
npm run test:e2e

# Testes da API
npm run test:api

# Testes do PWA
npm run test:web

# Playwright UI (interativo)
npx playwright test --ui
```

### Docker

```bash
# Build das imagens
npm run docker:build
# ou: docker-compose build

# Iniciar containers
npm run docker:up
# ou: docker-compose up

# Parar containers
npm run docker:down
# ou: docker-compose down

# Ver logs
npm run docker:logs
# ou: docker-compose logs -f

# Rebuild completo
docker-compose up --build --force-recreate
```

### CI

```bash
# Simular CI localmente
npm run ci

# Instalar tudo (fresh install)
npm run install:all
```

## 🔍 Verificar Status

### API

```bash
# Health check
curl http://localhost:3000/api/health

# Listar tarefas
curl http://localhost:3000/api/tasks

# Stats
curl http://localhost:3000/api/stats
```

### PWA

```bash
# Servir build local
npx http-server apps/web/dist -p 8080

# Analisar bundle
cd apps/web && npm run build -- --mode analyze
```

## 🐛 Debug

### Ver logs da API (Docker)

```bash
docker-compose logs api
docker-compose logs -f api  # follow
```

### Ver logs do PWA (Docker)

```bash
docker-compose logs web
```

### Limpar tudo

```bash
# Parar containers
docker-compose down

# Remover volumes
docker-compose down -v

# Limpar node_modules
rm -rf node_modules apps/*/node_modules

# Fresh start
npm run install:all
```

## 📦 Estrutura de Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| PWA (dev) | 8080 | http://localhost:8080 |
| API | 3000 | http://localhost:3000 |
| Playwright Report | 9323 | http://localhost:9323 |

## ✅ Checklist Rápido

- [ ] Instalar Node.js 20+
- [ ] Instalar Docker (opcional)
- [ ] Clonar repositório
- [ ] `npm run install:all`
- [ ] `npm run dev`
- [ ] Abrir http://localhost:8080
- [ ] Adicionar tarefa
- [ ] Iniciar timer
- [ ] Tudo funcionando? ✨

## 🆘 Problemas Comuns

### Porta já em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Docker não inicia

```bash
# Verificar se Docker está rodando
docker --version
docker-compose --version

# Limpar cache do Docker
docker system prune -a
```

### Build falha

```bash
# Limpar cache do Vite
rm -rf apps/web/.vite apps/web/dist

# Rebuild
cd apps/web && npm run build
```

---

**Dúvidas?** Veja [ENTREGA-PARTE-3.md](ENTREGA-PARTE-3.md) para mais detalhes.
