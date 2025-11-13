# PomoTask API

Backend Node/Express para sincronização do PomoTask PWA.

## 🚀 Quick Start

```bash
npm install
npm start        # Produção
npm run dev      # Desenvolvimento (hot reload)
```

Acesse: http://localhost:3000/api/health

## 📌 Endpoints

Veja documentação completa no [README principal](../../README-PWA.md#-api-endpoints).

## 🐳 Docker

```bash
docker build -t pomo-task-api .
docker run -p 3000:3000 pomo-task-api
```

## 🧪 Testes

```bash
npm test
```

## 📦 Estrutura

```
src/
└── index.js    # API Express com todos os endpoints
```

## 🔧 Configuração

- `PORT` - Porta do servidor (default: 3000)
- `NODE_ENV` - Ambiente (development/production)
