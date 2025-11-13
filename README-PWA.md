# 🍅 PomoTask PWA

[![PWA CI/CD](https://github.com/mariisena/pomo-task/actions/workflows/pwa-ci-cd.yml/badge.svg)](https://github.com/mariisena/pomo-task/actions/workflows/pwa-ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Progressive Web App** com técnica Pomodoro e gerenciador de tarefas integrado. Foque, organize e conquiste suas metas com sincronização em nuvem!

🌐 **[Demo ao vivo](https://mariisena.github.io/pomo-task/)** | 📱 **Instalável** | 🔄 **Funciona Offline**

---

## 📱 O que é um PWA?

Progressive Web App (PWA) é uma aplicação web que oferece experiência similar a apps nativos:

- ✅ **Instalável** - Adicione à tela inicial (mobile/desktop)
- 🔄 **Offline First** - Funciona sem internet
- 🚀 **Performance** - Carregamento rápido e responsivo
- 🔔 **Push Notifications** - Receba alertas (futuro)
- 📱 **Responsivo** - Mobile, tablet e desktop

---

## ✨ Funcionalidades

### Timer Pomodoro
- ⏱️ Timer personalizável (foco, pausa curta, pausa longa)
- 🔄 Ciclos automáticos com contador de rounds
- 🔔 Notificações web ao completar sessões
- 🔊 Alertas sonoros opcionais
- 💾 Persistência de estado (retoma de onde parou)

### Gerenciador de Tarefas
- ✅ CRUD completo (criar, editar, marcar, deletar)
- 🔄 **Sincronização com servidor** (online/offline)
- 💾 Persistência local (localStorage)
- 📊 Indicador de status de conexão
- 🎯 Edição rápida com duplo clique

### Configurações
- ⚙️ Ajuste tempos de foco e pausas
- 🔢 Configure número de rodadas
- 🔊 Ative/desative sons
- 💾 Salvamento automático

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
│   │   ├── public/       # Assets estáticos
│   │   ├── index.html    # HTML principal
│   │   ├── vite.config.js # Config Vite + PWA
│   │   └── Dockerfile
│   │
│   └── api/              # Backend (Node/Express)
│       ├── src/
│       │   └── index.js  # API REST
│       ├── package.json
│       └── Dockerfile
│
├── extension/            # Extensão Chrome original
├── tests/
│   └── pwa/             # Testes E2E (Playwright)
├── docker-compose.yml   # Orquestração
└── .github/workflows/   # CI/CD
```

### Stack Tecnológico

**Frontend (PWA)**
- Vite - Build tool e dev server
- Vite PWA Plugin - Service Worker e Manifest
- Vanilla JavaScript (ES6+) - Sem frameworks
- CSS3 - Variáveis CSS e responsivo
- Workbox - Estratégias de cache

**Backend (API)**
- Node.js 20
- Express - Framework web
- CORS - Cross-origin
- Armazenamento em memória (demo)

**DevOps**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Playwright (E2E tests)
- Nginx (produção)

---

## 🚀 Instalação e Uso

### 📋 Pré-requisitos

- Node.js 20+
- npm 9+
- Docker & Docker Compose (opcional)

### 🛠️ Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone https://github.com/mariisena/pomo-task.git
cd pomo-task
```

2. **Instale todas as dependências**
```bash
npm run install:all
```

3. **Inicie API e PWA em paralelo**
```bash
npm run dev
```

Acesse:
- 🌐 **PWA**: http://localhost:8080
- 🔌 **API**: http://localhost:3000

### 🐳 Docker Compose

**Buildar e iniciar tudo:**
```bash
docker-compose up --build
```

Acesse:
- 🌐 **PWA**: http://localhost:8080
- 🔌 **API**: http://localhost:3000/api/health

**Comandos úteis:**
```bash
npm run docker:build   # Build das imagens
npm run docker:up      # Iniciar containers
npm run docker:down    # Parar containers
npm run docker:logs    # Ver logs
```

### 📦 Build de Produção

**PWA:**
```bash
cd apps/web
npm run build
# Output: apps/web/dist/
```

**API:**
```bash
cd apps/api
npm ci --omit=dev
# Pronto para produção
```

---

## 🧪 Testes

### Testes E2E (Playwright)

```bash
# Todos os testes
npm test

# Apenas E2E
npm run test:e2e

# Testes da API
npm run test:api

# Modo UI (interativo)
npx playwright test --ui
```

### Cobertura de Testes

- ✅ Timer (start, pause, reset, complete session)
- ✅ Tarefas (CRUD completo)
- ✅ Navegação entre views
- ✅ Configurações
- ✅ Persistência local
- ✅ API endpoints
- ✅ Responsividade (mobile/desktop)
- ✅ PWA (manifest, service worker)

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

**Exemplo de request:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Estudar PWA", "completed": false}'
```

---

## 🌐 Deploy

### GitHub Pages

O PWA é automaticamente deployado no GitHub Pages via CI/CD quando há push na branch `main`.

**URL de Produção:** https://mariisena.github.io/pomo-task/

### CI/CD Pipeline

O workflow `.github/workflows/pwa-ci-cd.yml` executa:

1. ✅ **Build** - Compila API e PWA
2. 🧪 **Testes** - Roda testes unitários e E2E
3. 📊 **Lighthouse** - Análise de performance (opcional)
4. 📦 **Artefatos** - Upload de reports e builds
5. 🚀 **Deploy** - Publica no GitHub Pages

**Ver última execução:**
[Actions](https://github.com/mariisena/pomo-task/actions)

---

## 📱 Instalando o PWA

### Desktop (Chrome/Edge)

1. Acesse https://mariisena.github.io/pomo-task/
2. Clique no ícone ➕ na barra de endereço
3. Selecione "Instalar PomoTask"
4. O app abrirá em janela própria

### Mobile (Android/iOS)

**Android (Chrome):**
1. Acesse o site
2. Toque no menu ⋮
3. "Adicionar à tela inicial"

**iOS (Safari):**
1. Acesse o site
2. Toque no ícone de compartilhar 📤
3. "Adicionar à Tela de Início"

---

## 📊 Performance PWA

Métricas Lighthouse (Target):

- ⚡ **Performance:** ≥ 90
- ♿ **Acessibilidade:** ≥ 90
- ✅ **Melhores Práticas:** ≥ 90
- 🔍 **SEO:** ≥ 90
- 📱 **PWA:** 100

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

**Convenção de commits:** [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autora

Desenvolvido para **Bootcamp II - Entrega Final (Parte 3)**

- 📧 Email: [seu-email]
- 🐙 GitHub: [@mariisena](https://github.com/mariisena)

---

## 🙏 Agradecimentos

- Técnica Pomodoro - Francesco Cirillo
- Ícones - SVG inline
- Fontes - Google Fonts
- Inspiração - Comunidade dev

---

**⭐ Se gostou, deixe uma estrela!**
