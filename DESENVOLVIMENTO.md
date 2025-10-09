# 📘 Diário de Desenvolvimento - PomoTask

**Autora:** Mariana Sena
**Projeto:** Extensão Chrome - PomoTask
**Período:** Bootcamp II
**Última atualização:** 2025-10-09

---

## 🎯 Objetivo do Projeto

Desenvolver uma extensão Chrome (Manifest V3) que integre a técnica Pomodoro com gerenciamento de tarefas, aplicando conceitos de:
- Chrome Extensions API
- JavaScript ES6+
- Persistência de dados local
- Testes E2E automatizados
- CI/CD com GitHub Actions

---

## 🛠️ Tecnologias Escolhidas

### Core
- **JavaScript Vanilla** - Sem frameworks para entender fundamentos
- **Manifest V3** - Versão mais recente (service workers, offscreen docs)
- **Chrome Storage API** - Persistência local sem backend

### Desenvolvimento
- **Playwright** - Testes E2E em ambiente real do Chrome
- **Docker** - Ambiente isolado para testes
- **GitHub Actions** - CI/CD automatizado

### Decisões Técnicas

**Por que Vanilla JS?**
- Aprendizado dos fundamentos sem abstrações
- Menor bundle size
- Performance nativa do navegador

**Por que Manifest V3?**
- Versão atual exigida pelo Chrome Web Store
- Melhor segurança (service workers vs background pages)
- Compatibilidade futura

**Por que Playwright?**
- Suporte oficial a Chrome Extensions
- Testes em navegador real (não headless mock)
- Debugging visual com traces

---

## 🏗️ Arquitetura Desenvolvida

### Padrão Manager Class

Cada módulo usa uma classe ES6 que encapsula:
- Estado interno
- Referências DOM
- Métodos de persistência
- Event handlers

```javascript
class PomodoroTimer {
  constructor() {
    this.state = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.bindEvents();
  }
}
```

**Vantagem:** Organização, reutilização, fácil manutenção

### Comunicação entre Componentes

**Popup ↔ Service Worker:**
```javascript
chrome.runtime.sendMessage({ type: 'notify', message: '...' });
```

**Iframe ↔ Popup Principal:**
```javascript
window.parent.postMessage({ type: 'navigate', view: 'settings-view' }, origin);
```

**Storage Sync (entre janelas):**
```javascript
chrome.storage.onChanged.addListener((changes) => {
  if (changes.timerState) this.updateUI();
});
```

### Desafios Resolvidos

#### 1. Áudio no Manifest V3
**Problema:** Service workers não têm DOM, não podem tocar áudio
**Solução:** Offscreen Documents
```javascript
await chrome.offscreen.createDocument({
  url: 'sounds.html',
  reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK]
});
```

#### 2. Navegação entre Views
**Primeira versão:** Listeners individuais em cada botão
**Refatorado:** Event delegation com `data-target`
```javascript
document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-target]');
  if (btn) this.showView(btn.dataset.target);
});
```

#### 3. Modal de Confirmação
**Problema:** `confirm()` nativo é feio e não customizável
**Solução:** Modal customizado com Promise-like pattern
```javascript
showConfirmationModal(message, onConfirm) {
  // Valida elementos, exibe modal, gerencia callbacks
}
```

---

## 🧪 Estratégia de Testes

### Setup E2E

```javascript
// Carregar extensão no Playwright
const extensionPath = path.join(__dirname, '..');
const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [`--load-extension=${extensionPath}`]
});
```

### Testes Implementados

1. ✅ Service worker ativo
2. ✅ Popup carrega elementos principais
3. ✅ Timer exibe tempo inicial
4. ✅ CRUD de tarefas funcional
5. ✅ Botões do timer respondem
6. ✅ Navegação entre views

### CI/CD Pipeline

```yaml
- npm ci (com cache de node_modules)
- npm run build
- Instalar Playwright + Chromium
- npm run test:e2e
- Upload de artifacts (extension.zip, reports)
```

---

## 🐛 Bugs Encontrados e Corrigidos

### Bug 1: Duplicação de Instâncias
**Sintoma:** Managers criados duas vezes, estado inconsistente
**Causa:** `popup.js` instanciava classes já auto-inicializadas
**Fix:** Remover duplicação, usar referências `window.*`

### Bug 2: CSP Muito Restritivo
**Sintoma:** Estilos inline quebrados
**Causa:** CSP sem `style-src 'unsafe-inline'`
**Fix:** Restaurar política correta no manifest

### Bug 3: postMessage Inseguro
**Sintoma:** Origem `'*'` permite leak de dados
**Causa:** Não validação de origem
**Fix:** Usar `window.location.origin`

### Bug 4: Event Listeners Redundantes
**Sintoma:** Código desnecessário
**Causa:** `removeEventListener` após `{ once: true }`
**Fix:** Remover código redundante

---

## 🤖 Uso de IA no Desenvolvimento

### Claude Code - Assistência Técnica

**Utilizado para:**

1. **Code Review (09/10/2025)**
   - Análise de 286 linhas de mudanças
   - Identificação de 13 issues (4 críticos)
   - Sugestões de refatoração

2. **Debugging**
   - CSP e permissões do manifest
   - Arquitetura de service workers
   - Offscreen documents para áudio

3. **Boas Práticas**
   - Padronização de código (aspas, indentação)
   - Segurança (postMessage origin)
   - Acessibilidade (ARIA labels)

4. **Testes**
   - Setup do Playwright
   - Estratégias de teste E2E
   - Validação de CI/CD

**O que a IA NÃO fez:**
- ❌ Arquitetura inicial (Manager pattern foi decisão minha)
- ❌ Lógica de negócio do Pomodoro
- ❌ Design da interface (CSS e estrutura HTML core)
- ❌ Escolha de tecnologias
- ❌ Implementação das features principais

**Transparência:**
- Todos os commits com IA marcados: `Co-Authored-By: Claude`
- Histórico auditável via `git log`
- Revisões manuais de todas as sugestões

---

## 📈 Evolução do Projeto

### Versão 0.1 (Inicial)
- Timer básico com setInterval
- Lista de tarefas simples
- Sem persistência

### Versão 0.5 (MVP)
- Chrome Storage API
- Notificações
- Configurações personalizáveis
- Ciclos de Pomodoro

### Versão 1.0 (Atual)
- Testes E2E automatizados
- CI/CD com GitHub Actions
- Modal de confirmação
- Navegação entre views
- Docker para testes
- Documentação completa

---

## 🎓 Aprendizados

### Técnicos
1. **Manifest V3** - Diferenças de V2, service workers, offscreen docs
2. **Chrome APIs** - Storage, Notifications, Alarms, Windows
3. **Playwright** - Testes E2E em extensões reais
4. **Event Delegation** - Performance e manutenibilidade
5. **CSP** - Content Security Policy em extensões

### Soft Skills
1. **Debugging sistemático** - Logs, breakpoints, network tab
2. **Git workflow** - Commits atômicos, mensagens descritivas
3. **Documentação** - README técnico, CLAUDE.md, este arquivo
4. **Code Review** - Aceitar críticas, refatorar sem ego

---

## 🚧 Desafios Pendentes

### Features não Implementadas
- [ ] Auto-check de tarefas no fim da pausa
- [ ] Dashboard de estatísticas
- [ ] Sincronização com conta Google
- [ ] Modo claro/escuro
- [ ] Pomodoros por tarefa (tracking individual)

### Melhorias Técnicas
- [ ] Testes unitários (atualmente só E2E)
- [ ] TypeScript para type safety
- [ ] Web Components para modularidade
- [ ] Service Worker com cache strategies

---

## 📊 Métricas do Projeto

- **Linhas de código:** ~800 (JavaScript) + ~400 (CSS)
- **Arquivos:** 15 principais
- **Commits:** 10+
- **Testes E2E:** 6 (100% passing)
- **Cobertura:** Funcionalidades principais
- **Build time:** ~2s
- **Extension size:** ~150KB

---

## 🔗 Referências Consultadas

### Documentação Oficial
- [Chrome Extensions - Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Offscreen Documents](https://developer.chrome.com/docs/extensions/reference/offscreen/)
- [Playwright Chrome Extensions](https://playwright.dev/docs/chrome-extensions)

### Artigos e Tutoriais
- "Migrating to Manifest V3" - Google
- "Service Workers in Chrome Extensions" - MDN
- "E2E Testing Chrome Extensions" - Playwright Blog

### Ferramentas
- Claude Code (Anthropic) - Code review e debugging
- GitHub Copilot - Autocomplete (desativado para aprendizado)
- Chrome DevTools - Debugging e performance

---

## 🎯 Conclusão

Este projeto foi uma jornada de aprendizado prático sobre desenvolvimento de extensões Chrome modernas. Os principais desafios foram:

1. **Manifest V3** - Mudança de paradigma (service workers)
2. **Persistência** - Chrome Storage vs localStorage
3. **Testes** - E2E em ambiente real de extensão
4. **Arquitetura** - Padrões escaláveis sem frameworks

O uso de IA (Claude Code) foi estratégico para:
- Acelerar debugging de issues complexos
- Aprender boas práticas da indústria
- Validar decisões arquiteturais

Mas a **essência do código, arquitetura e lógica de negócio são de autoria própria**, com a IA servindo como mentor técnico virtual.

---

**Status:** ✅ Projeto concluído e funcional
**Próxima versão:** 2.0 com dashboard e sincronização na nuvem
