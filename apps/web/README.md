# PomoTask PWA (Frontend)

Progressive Web App construído com Vite + Vanilla JavaScript.

## 🚀 Quick Start

```bash
npm install
npm run dev      # Desenvolvimento
npm run build    # Produção
npm run preview  # Preview do build
```

Acesse: http://localhost:8080

## 📦 Build

```bash
npm run build
# Output: dist/
```

O build inclui:
- Service Worker gerado automaticamente
- Manifest PWA
- Assets otimizados e minificados
- Cache strategies (Workbox)

## 🐳 Docker

```bash
docker build -t pomo-task-web .
docker run -p 8080:80 pomo-task-web
```

## 🧪 Testes

```bash
npm test
```

## 📂 Estrutura

```
src/
├── js/
│   ├── pomodoro-timer.js    # Lógica do timer
│   ├── tasks.js             # Gerenciador de tarefas
│   ├── settings.js          # Configurações
│   └── navigation.js        # Navegação
├── styles/
│   ├── main.css            # Estilos base
│   ├── timer.css           # Timer
│   ├── tasks.css           # Tarefas
│   ├── settings.css        # Configurações
│   └── responsive.css      # Media queries
└── main.js                 # Entry point

public/
├── icons/                  # Ícones PWA
└── sounds/                 # Sons de notificação
```

## 🔧 Configuração

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Configure a URL da API:

```
VITE_API_URL=http://localhost:3000
```

## 📱 PWA Features

- ✅ Installable (desktop & mobile)
- ✅ Offline-capable (Service Worker)
- ✅ App-like experience
- ✅ Fast (Cache strategies)
- ✅ Responsive (mobile-first)

## 🏗️ Tecnologias

- **Vite** - Build tool
- **Vite PWA Plugin** - PWA automation
- **Workbox** - Service Worker strategies
- **Vanilla JavaScript** - No frameworks
- **CSS3** - Modern CSS
