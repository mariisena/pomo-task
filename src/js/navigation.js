/**
 * Navigation.js - Gerencia a navegação entre as diferentes views da extensão
 * Compatível com Manifest V3 - sem código inline
 */

class NavigationManager {
  constructor() {
    this.views = {
      main: document.getElementById('main-view'),
      mini: document.getElementById('mini-view'),
      settings: document.getElementById('settings-view')
    };
    
    this.currentView = 'main';
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedView();
  }

  bindEvents() {
    // Botão para abrir configurações
    const openSettingsBtn = document.getElementById('open-settings');
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => this.showView('settings'));
    }

    // Botão para voltar às configurações
    const backToMainBtn = document.getElementById('back-to-main');
    if (backToMainBtn) {
      backToMainBtn.addEventListener('click', () => this.showView('main'));
    }

    // Gerenciar menu dropdown de tarefas
    this.initTaskMenu();

    // Gerenciar teclas de atalho
    this.initKeyboardShortcuts();
  }

  initTaskMenu() {
    const menuBtn = document.getElementById('task-menu-btn');
    const menu = document.getElementById('task-menu');
    
    if (!menuBtn || !menu) return;

    // Toggle menu
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      this.toggleTaskMenu(!isExpanded);
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        this.toggleTaskMenu(false);
      }
    });

    // Navegação por teclado no menu
    menu.addEventListener('keydown', (e) => {
      const menuItems = menu.querySelectorAll('[role="menuitem"]');
      const currentIndex = Array.from(menuItems).indexOf(document.activeElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % menuItems.length;
          menuItems[nextIndex].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
          menuItems[prevIndex].focus();
          break;
        case 'Escape':
          this.toggleTaskMenu(false);
          menuBtn.focus();
          break;
      }
    });
  }

  toggleTaskMenu(show) {
    const menuBtn = document.getElementById('task-menu-btn');
    const menu = document.getElementById('task-menu');
    
    if (!menuBtn || !menu) return;

    menuBtn.setAttribute('aria-expanded', show.toString());
    menu.style.display = show ? 'block' : 'none';
    
    if (show) {
      // Focar no primeiro item do menu
      const firstItem = menu.querySelector('[role="menuitem"]');
      if (firstItem) {
        firstItem.focus();
      }
    }
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + , para abrir configurações
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        this.showView('settings');
      }
      
      // Escape para voltar à view principal
      if (e.key === 'Escape' && this.currentView !== 'main') {
        this.showView('main');
      }
    });
  }

  showView(viewName) {
    if (!this.views[viewName]) {
      console.error(`View "${viewName}" não encontrada`);
      return;
    }

    // Esconder todas as views
    Object.values(this.views).forEach(view => {
      view.classList.add('hidden');
    });

    // Mostrar a view solicitada
    this.views[viewName].classList.remove('hidden');
    this.currentView = viewName;

    // Salvar preferência
    this.saveCurrentView();

    // Focar no elemento apropriado
    this.focusOnViewChange(viewName);

    // Anunciar mudança para leitores de tela
    this.announceViewChange(viewName);
  }

  focusOnViewChange(viewName) {
    // Aguardar um frame para garantir que a view esteja visível
    requestAnimationFrame(() => {
      let elementToFocus;
      
      switch (viewName) {
        case 'main':
          elementToFocus = document.getElementById('main-start-btn');
          break;
        case 'settings':
          elementToFocus = document.getElementById('focus-duration');
          break;
        case 'mini':
          elementToFocus = document.getElementById('mini-start-btn');
          break;
      }
      
      if (elementToFocus) {
        elementToFocus.focus();
      }
    });
  }

  announceViewChange(viewName) {
    const announcements = {
      main: 'Tela principal carregada',
      settings: 'Configurações abertas',
      mini: 'Visualização compacta ativada'
    };

    const announcement = announcements[viewName];
    if (announcement) {
      this.announce(announcement);
    }
  }

  announce(message) {
    // Criar elemento temporário para anúncio
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remover após o anúncio
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  saveCurrentView() {
    try {
      chrome.storage.local.set({ currentView: this.currentView });
    } catch (error) {
      // Fallback para localStorage se chrome.storage não estiver disponível
      localStorage.setItem('pomoTasks_currentView', this.currentView);
    }
  }

  async loadSavedView() {
    try {
      const result = await chrome.storage.local.get(['currentView']);
      const savedView = result.currentView || 'main';
      this.showView(savedView);
    } catch (error) {
      // Fallback para localStorage
      const savedView = localStorage.getItem('pomoTasks_currentView') || 'main';
      this.showView(savedView);
    }
  }

  // Método público para outras partes da aplicação
  getCurrentView() {
    return this.currentView;
  }

  // Método para alternar para mini view (usado pelo toggle nas configurações)
  toggleMiniView(enable) {
    if (enable) {
      this.showView('mini');
    } else {
      this.showView('main');
    }
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
});

// Exportar para uso em outros módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationManager;
}