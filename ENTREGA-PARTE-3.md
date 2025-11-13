# 📦 Instruções de Entrega - Parte 3 (PWA)

## ✅ O que foi implementado

### 1. PWA Completo (30%)
- ✅ Manifest válido (gerado automaticamente pelo Vite PWA Plugin)
- ✅ Service Worker funcional com cache offline (Workbox)
- ✅ Installability (pode ser instalado no desktop/mobile)
- ✅ Performance otimizada (build com Vite)

### 2. Integração com API/Backend (25%)
- ✅ Backend Node/Express com endpoints REST
- ✅ Sincronização de tarefas (online/offline)
- ✅ Registro de ciclos pomodoro
- ✅ Estatísticas de produtividade
- ✅ Tratamento de erros

### 3. Containers (15%)
- ✅ Dockerfile para API
- ✅ Dockerfile para PWA (multi-stage com Nginx)
- ✅ Docker Compose orquestrando web + api
- ✅ Healthchecks configurados
- ✅ Execução local reprodutível

### 4. Testes (15%)
- ✅ Testes E2E com Playwright (PWA + API)
- ✅ Múltiplos browsers (Chromium, Firefox)
- ✅ Testes de responsividade
- ✅ Artefatos no CI

### 5. CI/CD (10%)
- ✅ Pipeline GitHub Actions
- ✅ Build automático
- ✅ Testes automáticos
- ✅ Deploy para GitHub Pages
- ✅ Lighthouse CI (opcional)

### 6. Documentação (5%)
- ✅ README completo
- ✅ Arquitetura documentada
- ✅ Instruções de instalação
- ✅ Documentação da API
- ✅ Convenções de commit

---

## 🚀 Como Testar Localmente

### Opção 1: Desenvolvimento (recomendado para testes rápidos)

```bash
# 1. Instalar dependências
npm run install:all

# 2. Iniciar tudo em paralelo
npm run dev
```

Acesse:
- 🌐 PWA: http://localhost:8080
- 🔌 API: http://localhost:3000/api/health

### Opção 2: Docker Compose (ambiente de produção)

```bash
# 1. Build e start
docker-compose up --build

# 2. Aguardar containers iniciarem (~2min)
# 3. Acessar
```

Acesse:
- 🌐 PWA: http://localhost:8080
- 🔌 API: http://localhost:3000/api/health

**Para parar:**
```bash
docker-compose down
```

---

## 🧪 Como Rodar os Testes

### Testes E2E (Playwright)

```bash
# Com API rodando (npm run dev ou docker-compose up)

# Rodar todos os testes
npm run test:e2e

# Rodar com UI interativa
npx playwright test --ui

# Rodar apenas testes do PWA
npx playwright test tests/pwa/pwa.spec.js

# Rodar apenas testes da API
npx playwright test tests/pwa/api.spec.js
```

### Ver Relatório

```bash
npx playwright show-report playwright-report
```

---

## 📱 Como Instalar o PWA

### 1. Publicar no GitHub Pages

**Configurar GitHub Pages primeiro:**

1. Vá em **Settings** do repositório
2. **Pages** → Source: **GitHub Actions**
3. Salvar

**Fazer push para main:**

```bash
git push origin main
```

O workflow `.github/workflows/pwa-ci-cd.yml` irá:
1. Fazer build
2. Rodar testes
3. Deploy para Pages

**Acesse em:** `https://SEU-USUARIO.github.io/pomo-task/`

### 2. Instalar PWA no Desktop

1. Acesse o site publicado
2. Clique no ícone ➕ na barra de endereço
3. "Instalar PomoTask"

### 3. Instalar PWA no Mobile

**Android:**
1. Abra no Chrome
2. Menu ⋮ → "Adicionar à tela inicial"

**iOS:**
1. Abra no Safari
2. Compartilhar 📤 → "Adicionar à Tela de Início"

---

## 🎬 Criar Vídeo/GIF Demo

### Opção 1: Gravação de Tela (3 min)

Use ferramentas gratuitas:
- **Windows**: Xbox Game Bar (Win + G)
- **Mac**: QuickTime Player
- **Linux**: SimpleScreenRecorder
- **Web**: Loom (https://loom.com)

**O que mostrar:**
1. Abrir o PWA publicado
2. Adicionar algumas tarefas
3. Iniciar timer Pomodoro
4. Configurar tempos
5. Mostrar sincronização (offline/online)
6. Instalar o PWA (se possível)

### Opção 2: GIF Animado

Use:
- **ScreenToGif** (Windows): https://www.screentogif.com/
- **Kap** (Mac): https://getkap.co/
- **Peek** (Linux): https://github.com/phw/peek

**Dicas:**
- Máximo 10MB
- 30-60 segundos
- Mostrar fluxo principal

---

## 📦 Checklist de Entrega

### Links para Enviar

- [ ] **Link do repositório GitHub**
  - Exemplo: `https://github.com/mariisena/pomo-task`

- [ ] **Link do PWA publicado (GitHub Pages)**
  - Exemplo: `https://mariisena.github.io/pomo-task/`

- [ ] **Link do último CI run**
  - Vá em Actions → último workflow → copiar URL
  - Exemplo: `https://github.com/mariisena/pomo-task/actions/runs/123456`

- [ ] **Vídeo/GIF demo** (≤ 3 min)
  - Upload no YouTube (pode ser não-listado)
  - Ou compartilhar GIF via Google Drive/Dropbox

### Verificar Antes de Entregar

- [ ] Todos os testes passando no CI
- [ ] PWA instalável (testar no mobile/desktop)
- [ ] Funciona offline (desconectar internet e testar)
- [ ] Docker Compose funciona (`docker-compose up`)
- [ ] README.md atualizado com instruções
- [ ] Artefatos disponíveis no GitHub Actions

---

## 🔧 Ajustes Finais Necessários

### 1. Atualizar URL da API no GitHub Pages

Edite `.github/workflows/pwa-ci-cd.yml` linha ~80:

```yaml
env:
  VITE_API_URL: https://SUA-API-HOSPEDADA.com
```

**Opções de hospedagem gratuita para API:**
- **Render**: https://render.com (recomendado)
- **Railway**: https://railway.app
- **Fly.io**: https://fly.io

**OU deixe sem API** (PWA funciona offline):
```yaml
env:
  VITE_API_URL: ''
```

### 2. Configurar GitHub Pages

Em **Settings → Pages**:
- Source: **GitHub Actions**
- Salvar

### 3. Adicionar Secrets (se necessário)

Se usar API com autenticação:
- Settings → Secrets → New repository secret

---

## 📊 Estrutura de Pastas Final

```
pomo-task/
├── apps/
│   ├── web/           # PWA (Frontend)
│   │   ├── dist/      # Build (gitignored)
│   │   ├── public/    # Assets
│   │   ├── src/       # Código
│   │   └── ...
│   └── api/           # Backend
│       ├── src/
│       └── ...
├── extension/         # Extensão original
├── tests/pwa/         # Testes E2E
├── .github/workflows/ # CI/CD
├── docker-compose.yml
├── README-PWA.md      # Documentação principal
└── package.json       # Scripts do monorepo
```

---

## 🎯 Critérios de Avaliação

| Item | % | Status |
|------|---|--------|
| PWA (manifest, SW, offline, performance) | 30% | ✅ Completo |
| API/Backend (endpoints, tratamento erros) | 25% | ✅ Completo |
| Containers (Docker, Compose) | 15% | ✅ Completo |
| Testes (E2E, artefatos) | 15% | ✅ Completo |
| CI/CD (build, test, deploy) | 10% | ✅ Completo |
| Documentação (README, código limpo) | 5% | ✅ Completo |

---

## 💡 Dicas Finais

1. **Teste no mobile real** - Use Chrome DevTools (F12) → Device Toolbar
2. **Verifique Lighthouse** - F12 → Lighthouse → Generate report
3. **Teste offline** - F12 → Network → Offline
4. **Commits organizados** - Já fizemos commits bem descritivos
5. **Screenshots** - Tire prints do PWA funcionando

---

## 🆘 Troubleshooting

### PWA não instala
- Certifique-se que está em HTTPS (GitHub Pages é HTTPS)
- Verifique manifest e SW no DevTools → Application

### Docker não inicia
- Rode `docker-compose logs` para ver erros
- Certifique-se que portas 3000 e 8080 estão livres

### Testes falham
- API deve estar rodando (`npm run dev:api`)
- Aguarde containers iniciarem completamente (~2min)

### Build falha no CI
- Verifique logs no Actions
- Tente rodar `npm run build` localmente primeiro

---

## ✨ Próximos Passos (Opcionais/Bônus)

- [ ] Adicionar testes unitários com Vitest
- [ ] Implementar dark/light mode
- [ ] Adicionar gráficos de produtividade (Chart.js)
- [ ] Push Notifications
- [ ] PWA Share Target API
- [ ] Internacionalização (i18n)

---

**Boa sorte na entrega! 🚀🍅**
