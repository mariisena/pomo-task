# 🚀 Bootcamp II – Entrega Final em Grupo (PWA + API/Backend • Containers • CI/CD)

Hora de promover sua extensão do Chrome (Entrega I) — já containerizada e testada (Entrega II) — a um PWA completo, adicionando uma camada de backend (API pública ou serviço próprio), executando tudo com Docker Compose, testando com Playwright/Jest e integrando em CI/CD no GitHub Actions.

## 📱 O que é um PWA (Progressive Web App)?
- App-like: site com experiência de aplicativo (instalável, ícone na tela inicial, splash)
- Manifest Web: arquivo manifest.webmanifest que descreve nome, ícones, cores, start_url, display, etc.
- Service Worker: script em background que habilita cache offline, atualização incremental, push e estratégia de rede (Cache First, Network First, Stale-While-Revalidate).
- HTTPS: obrigatório para registrar service worker (GitHub Pages já atende).
- Performance: atender a métricas Lighthouse (PWA/Performance/A11y/Best Practices/SEO).

## 🧩 Requisitos do Projeto (grupo)
- Escolher uma das extensões da turma (Entrega I) e **convertê-la/derivar** para um PWA funcional (pode manter a extensão, mas a entrega final é o **PWA**).
- Conectar a uma API: usar API pública (ver exemplos abaixo) ou backend próprio (Node/Express, FastAPI, etc.).
- Executar tudo por Docker Compose (pelo menos 2 serviços: web PWA + api; opcional: banco).
- CI no GitHub Actions: build, testes (unit/E2E), relatório Lighthouse (opcional + bônus) e artefatos.
- Publicar **PWA no GitHub Pages** e documentar instalação/uso no README.md.

## 🌐 Exemplos de APIs Públicas
- OpenWeatherMap (tempo), PokéAPI (dados Pokémon), OMDb (filmes), SpaceX API (lançamentos), TheCatAPI/TheDogAPI (imagens), ViaCEP (endereços BR), IBGE APIs (censos), GitHub REST (repositórios).
- Se criar **backend próprio**, exponha endpoints REST/JSON, com documentação (Swagger/OpenAPI opcional).

## 🏗️ Arquitetura Sugerida
```
monorepo-pwa/
├─ apps/
│  ├─ web/                 # PWA (Vite/React ou Vanilla)
│  └─ api/                 # Backend (Node/Express)
├─ packages/               # (opcional) libs compartilhadas
├─ docker-compose.yml
├─ .github/workflows/ci.yml
└─ README.md
```

## 📜 PWA — Manifest e Service Worker

apps/web/public/manifest.webmanifest
```
{
  "name": "Bootcamp PWA",
  "short_name": "BootPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ec0089",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

apps/web/src/service-worker.js (exemplo simples)
```
const CACHE = 'bootcamp-cache-v1';
const ASSETS = ['/', '/index.html', '/styles.css'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
```

## 🧠 Backend (Node/Express — exemplo)
```
// apps/api/index.js
import express from 'express';
const app = express();
app.get('/api/hello', (req,res)=>res.json({ ok:true, msg:'Hello Bootcamp!' }));
app.listen(3000, ()=>console.log('API on :3000'));
```   

## 🐳 docker-compose.yml (exemplo)
```
services:
  api:
    build: ./apps/api
    ports: ["3000:3000"]
    container_name: bootcamp-api
  web:
    build: ./apps/web
    ports: ["8080:80"]
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on: [api]
    container_name: bootcamp-web
```

**apps/web/Dockerfile (Vite + Nginx)**
```
# build
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build
# serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

**apps/api/Dockerfile (Node)**
```
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node","index.js"]
```

## ⚙️ GitHub Actions (build, testes e artefatos)
```
name: CI
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Instalar deps
        run: |
          cd apps/web && npm ci
          cd ../../apps/api && npm ci
      - name: Testes unitários (web/api)
        run: |
          cd apps/web && npm test --if-present
          cd ../../apps/api && npm test --if-present
      - name: Build web
        run: cd apps/web && npm run build
      - name: Lighthouse (opcional)
        if: always()
        run: npx @lhci/cli autorun || true
      - name: Upload artefatos
        uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: apps/web/dist
```

## 🧪 Testes E2E (Playwright) – exemplo
```
import { test, expect } from '@playwright/test';
const BASE = process.env.E2E_BASE_URL || 'http://localhost:8080';

test('PWA carrega e consome API', async ({ page }) => {
  await page.goto(BASE);
  await expect(page).toHaveTitle(/Bootcamp/);
  await page.waitForSelector('[data-testid="api-ok"]');
});
```    

## 🌐 Publicação
- Host do PWA no GitHub Pages (branch gh-pages ou pasta /docs), com HTTPS.
- Documentar no README.md: arquitetura, como rodar com Compose, endpoints da API, testes, deploy.

## 🧮 Critérios de Avaliação (100%)
- PWA (30%) — Manifest válido, service worker funcional (offline básico), installability e performance (Lighthouse ≥ 80).
- Integração com API/Backend (25%) — Consumo de API pública ou backend próprio com endpoints claros e tratamento de erros.
- Containers (15%) — Dockerfiles funcionais, Compose orquestrando web+api (+db opcional) e execução local reprodutível.
- Testes (15%) — Unitários e E2E (Playwright) passando; relatório no CI (artefatos).
- CI/CD (10%) — Pipeline build/test/report funcionando no GitHub Actions; publicação no Pages.
- Documentação & Qualidade (5%) — README, convenções de commits, organização de pastas, acessibilidade básica.

📨 Como Entregar 
- Link do repositório (monorepo) com web/api, Dockerfiles, Compose e workflows.
- Link do GitHub Pages com o PWA publicado.
- Link do run do CI (última execução) e artefatos (relatório Playwright/Lighthouse).
- Breve vídeo (≤ 3 min) ou GIF mostrando instalação do PWA e fluxo principal.