# 🍅 PomoTask

[![PWA CI/CD](https://github.com/mariisena/pomo-task/actions/workflows/pwa-ci-cd.yml/badge.svg)](https://github.com/mariisena/pomo-task/actions/workflows/pwa-ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Progressive Web App** com técnica Pomodoro e gerenciador de tarefas integrado. Foque, organize e conquiste suas metas com sincronização em nuvem!

🌐 **[Demo ao vivo](https://mariisena.github.io/pomo-task/)** | 📱 **Instalável** | 🔄 **Funciona Offline**

---

## 📱 O que é este Projeto?

PomoTask é um **PWA (Progressive Web App)** completo que combina:
- ⏱️ **Timer Pomodoro** personalizável
- ✅ **Gerenciador de Tarefas** com CRUD completo
- 🔄 **Sincronização** online/offline
- 🔔 **Notificações** web
- 📱 **Instalável** como app nativo

---

## ✨ Funcionalidades

### Timer Pomodoro
- ⏱️ Contador regressivo personalizável (5-90 min)
- 🔄 Ciclos automáticos (Foco → Pausa Curta → Foco → Pausa Longa)
- 🔔 Notificações web ao completar sessões
- 🔊 Alertas sonoros opcionais
- 💾 Persistência de estado (retoma de onde parou)

### Gerenciador de Tarefas
- ✅ CRUD completo (criar, editar, marcar, deletar)
- 🔄 Sincronização com servidor (online/offline)
- 💾 Persistência local (localStorage)
- 📊 Indicador de status de conexão
- 🎯 Edição rápida com duplo clique

### Configurações
- ⚙️ Ajuste tempos de foco e pausas
- 🔢 Configure número de rodadas (1-10)
- 🔊 Ative/desative sons
- 💾 Salvamento automático

---

## 🚀 Acesso Rápido

### 🌐 Usar Online (Recomendado)

Acesse diretamente: **https://mariisena.github.io/pomo-task/**

### 📥 Instalar como App

**Desktop (Chrome/Edge):**
1. Acesse o link acima
2. Clique no ícone ➕ na barra de endereço
3. "Instalar PomoTask"

**Mobile (Android):**
1. Abra no Chrome
2. Menu ⋮ → "Adicionar à tela inicial"

**Mobile (iOS):**
1. Abra no Safari
2. Compartilhar 📤 → "Adicionar à Tela de Início"

### 📦 Extensão Chrome (Legacy)

Baixe a extensão: [Releases](https://github.com/mariisena/pomo-task/releases)

---

## 🏗️ Arquitetura

Este projeto utiliza uma **arquitetura monorepo** com backend e frontend separados:

```
pomo-task/
├── apps/
│   ├── web/              # PWA (Frontend)
│   │   ├── src/
│   │   │   ├── js/       # Lógica da aplicação
│   │   │   ├── styles/   # CSS modular
│   │   │   └── main.js   # Entry point
│   │   └── vite.config.js
│   │
│   └── api/              # Backend (Node/Express)
│       └── src/
│           └── index.js  # API REST
│
├── extension/            # Extensão Chrome (legacy)
├── tests/pwa/           # Testes E2E (Playwright)
├── docker-compose.yml   # Orquestração
└── .github/workflows/   # CI/CD
```

### Stack Tecnológico

**Frontend (PWA)**
- Vite - Build tool e dev server
- Vite PWA Plugin - Service Worker e Manifest
- Vanilla JavaScript (ES6+)
- CSS3 - Variáveis CSS e responsivo
- Workbox - Estratégias de cache

**Backend (API)**
- Node.js 20
- Express - Framework web
- CORS - Cross-origin

**DevOps**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Playwright (E2E tests)
- Nginx (produção)

---

## 💻 Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- npm 9+
- Docker & Docker Compose (opcional)

### Quick Start

```bash
# 1. Clonar repositório
git clone https://github.com/mariisena/pomo-task.git
cd pomo-task

# 2. Instalar dependências
npm run install:all

# 3. Rodar em desenvolvimento (API + PWA)
npm run dev
```

Acesse:
- 🌐 **PWA**: http://localhost:8080
- 🔌 **API**: http://localhost:3000/api/health

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # API + PWA em paralelo
npm run dev:api          # Apenas API
npm run dev:web          # Apenas PWA

# Build
npm run build            # Build completo
npm run build:api        # Build da API
npm run build:web        # Build do PWA

# Testes
npm test                 # Todos os testes
npm run test:e2e         # Testes E2E
npx playwright test --ui # Playwright UI (interativo)

# Docker
npm run docker:up        # Iniciar containers
npm run docker:down      # Parar containers
npm run docker:logs      # Ver logs
```

Veja mais comandos em: [QUICK-START.md](QUICK-START.md)

---

## 🐳 Docker

### Rodar com Docker Compose

```bash
# Build e iniciar
docker-compose up --build

# Ou em background
docker-compose up -d
```

Acesse:
- 🌐 **PWA**: http://localhost:8080
- 🔌 **API**: http://localhost:3000

### Parar

```bash
docker-compose down
```

---

## 🧪 Testes

### Testes E2E (Playwright)

```bash
# Com API rodando
npm run dev:api  # Terminal 1
npm run test:e2e # Terminal 2

# Ou automático
npm run test:e2e:with-api

# UI interativa
npx playwright test --ui
```

### Cobertura

- ✅ Timer (start, pause, reset, complete)
- ✅ Tarefas (CRUD completo)
- ✅ Navegação entre views
- ✅ Configurações
- ✅ Persistência local
- ✅ API endpoints
- ✅ Responsividade

**Total:** 25/26 testes passando (96%)

---

## 🚀 Deploy

### GitHub Pages

O PWA é automaticamente deployado via GitHub Actions quando há push na `main`.

**URL:** https://mariisena.github.io/pomo-task/

### CI/CD Pipeline

O workflow `.github/workflows/pwa-ci-cd.yml` executa:

1. ✅ **Build** - Compila API e PWA
2. 🧪 **Testes** - Roda testes E2E
3. 📦 **Artefatos** - Upload de reports e builds
4. 🚀 **Deploy** - Publica no GitHub Pages

**Ver execuções:** [Actions](https://github.com/mariisena/pomo-task/actions)

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000/api`

### Tarefas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/tasks` | Listar todas |
| `POST` | `/tasks` | Criar nova |
| `PUT` | `/tasks/:id` | Atualizar |
| `DELETE` | `/tasks/:id` | Deletar |
| `POST` | `/tasks/sync` | Sincronização bulk |

### Ciclos Pomodoro

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/cycles` | Listar ciclos |
| `POST` | `/cycles` | Registrar ciclo |
| `GET` | `/stats` | Estatísticas |

### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Status da API |

---

## 📚 Documentação

- [QUICK-START.md](QUICK-START.md) - Comandos rápidos
- [ENTREGA-PARTE-3.md](ENTREGA-PARTE-3.md) - Guia de entrega
- [SUMMARY.md](SUMMARY.md) - Resumo e métricas
- [docs/](docs/) - Documentação adicional

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

**Convenção de commits:** [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📊 Status do Projeto

- ✅ PWA funcional (instalável, offline)
- ✅ Backend API REST
- ✅ Docker + Docker Compose
- ✅ CI/CD automatizado
- ✅ Testes E2E (96% passing)
- ✅ Deploy automático (GitHub Pages)
- ✅ Documentação completa

---

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autora

Desenvolvido para **Bootcamp II - Entrega Final (Parte 3)**

- 🐙 GitHub: [@mariisena](https://github.com/mariisena)
- 🌐 Demo: [PomoTask PWA](https://mariisena.github.io/pomo-task/)

---

## 🙏 Agradecimentos

- Técnica Pomodoro - Francesco Cirillo
- Ícones - Inline SVG
- Fontes - Google Fonts

---

**⭐ Se gostou, deixe uma estrela!**
