# 🍅 PomoTask

[![CI - Build & E2E Tests](https://github.com/mariisena/pomo-task/actions/workflows/ci.yml/badge.svg)](https://github.com/mariisena/pomo-task/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Extensão Pomodoro com lista de tarefas integrada para Google Chrome.
Foque, organize e conclua suas metas de forma prática!

## 📌 Descrição

O PomoTask é uma extensão para Google Chrome (Manifest V3) que combina a técnica Pomodoro com um gerenciador de tarefas minimalista. A proposta é ajudar estudantes e profissionais a manterem o foco, equilibrando tempo de estudo/trabalho com pausas estratégicas.

## ✨ Funcionalidades

- ⏱️ **Timer Pomodoro personalizável** (foco, pausa curta e pausa longa)
- ✅ **Lista de tarefas** com CRUD completo e persistência local
- 🔔 **Notificações** de início e fim de ciclos
- 🔊 **Alertas sonoros** opcionais
- 📊 **Histórico de ciclos** concluídos
- 🎨 **Interface moderna** e responsiva
- 🌐 **Navegação entre views** (principal e configurações)
- ✋ **Modal de confirmação** para ações críticas

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Chrome APIs:** Storage, Notifications, Alarms, Offscreen Documents
- **Manifest:** V3 (última versão do Chrome Extensions)
- **Testes:** Playwright (E2E)
- **CI/CD:** GitHub Actions
- **Containerização:** Docker (para testes)

## 📦 Instalação

### Modo Desenvolvedor

1. Clone o repositório:
```bash
git clone https://github.com/mariisena/pomo-task.git
cd pomo-task
```

2. Instale as dependências (para desenvolvimento/testes):
```bash
npm install
```

3. Carregue a extensão no Chrome:
   - Abra `chrome://extensions/`
   - Ative o **Modo do desenvolvedor** (canto superior direito)
   - Clique em **Carregar sem compactação**
   - Selecione a pasta do projeto
   - O ícone 🍅 aparecerá na barra de extensões!

### Build de Produção

```bash
npm run build
```

Gera a pasta `dist/` e o arquivo `extension.zip` prontos para distribuição.

## 🚀 Como Usar

1. Clique no ícone do PomoTask no navegador
2. Adicione suas tarefas na lista
3. Configure os tempos em ⚙️ Configurações (opcional)
4. Inicie o timer Pomodoro e mantenha o foco
5. Marque as tarefas concluídas conforme avança

## 🧪 Testes

```bash
npm test            # Build + testes E2E
npm run test:e2e    # Apenas testes E2E
npm run ci          # Simula ambiente CI
```

### Docker

```bash
docker-compose up       # Rodar testes em container
docker-compose build    # Rebuild após mudanças
```

## 🏗️ Arquitetura

```
src/
├── background/
│   └── service-worker.js      # Notificações e áudio em background
├── js/
│   ├── pomodoro-timer.js      # Lógica do timer
│   ├── tasks.js               # Gerenciamento de tarefas
│   ├── settings.js            # Configurações
│   ├── navigation.js          # Navegação entre views
│   └── header.js              # Lógica do header
├── popup/
│   ├── popup.html             # Interface principal
│   ├── popup.js               # Inicialização
│   ├── popup.css              # Estilos principais
│   └── html/                  # Componentes modulares (iframes)
└── icons/                     # Ícones da extensão
```

### Padrões Utilizados

- **Manager Classes:** Cada módulo tem uma classe ES6 que gerencia estado e UI
- **Chrome Storage API:** Persistência de dados local
- **Event Delegation:** Navegação eficiente com `data-target`
- **Offscreen Documents:** Reprodução de áudio (Manifest V3)
- **Modal Pattern:** Confirmações customizadas substituindo `confirm()`

## 🤝 Desenvolvimento e Contribuições

### Autoria

- **Desenvolvido por:** [Mariana Sena](https://github.com/mariisena)
- **Projeto acadêmico:** Bootcamp II - Desenvolvimento de Extensões Chrome

### Ferramentas de IA Utilizadas

Este projeto utilizou **Claude Code** (Anthropic) como assistente de desenvolvimento para:

- ✅ **Code review** e identificação de bugs
- ✅ **Refatoração** de código (navegação, modal, service worker)
- ✅ **Correção de issues** críticos (CSP, duplicação de instâncias, segurança)
- ✅ **Padronização** de código (aspas, estrutura HTML)
- ✅ **Testes E2E** e validação de funcionalidades
- ✅ **Documentação** (CLAUDE.md, README)

**Transparência acadêmica:** O uso de IA foi para assistência técnica, debugging e boas práticas. A arquitetura, lógica de negócio e implementação core foram desenvolvidas manualmente. Todos os commits com auxílio de IA estão marcados com `Co-Authored-By: Claude`.

### Histórico de Commits

```bash
git log --oneline  # Ver histórico completo
```

Commits com IA identificados por:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 📌 Próximos Passos

- 🔄 Sincronização com conta Google
- 🌙 Modo claro/escuro
- 📊 Dashboard com estatísticas avançadas
- ⚡ Implementar feature `autoCheck`
- 🎯 Pomodoros por tarefa (tracking individual)

## 📚 Documentação Técnica

Veja [CLAUDE.md](CLAUDE.md) para detalhes de arquitetura, padrões de código e guias de desenvolvimento.

## 📄 Licença

Este projeto está sob a licença MIT.