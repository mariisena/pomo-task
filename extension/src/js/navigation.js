// Navigation.js - Gerencia navegação
class NavigationManager {
  constructor() {
    this.views = {
      main: document.getElementById('main-view'),
      settings: document.getElementById('settings-view'),
      mini: document.getElementById('mini-view') || null
    };
    this.currentView = 'main';
    this.init();
  }

  init() {
    this.loadSavedView();
    // Esperar o iframe carregar antes de adicionar eventos
    const headerFrame = document.querySelector('.header-frame');
    if (headerFrame) {
      headerFrame.addEventListener('load', () => {
        this.bindEvents();
      });
      // Se já carregou, chamar imediatamente
      if (headerFrame.contentDocument && headerFrame.contentDocument.readyState === 'complete') {
        this.bindEvents();
      }
    } else {
      this.bindEvents();
    }
  }

  bindEvents() {
    document.body.addEventListener('click', (e) => {
      const targetButton = e.target.closest('[data-target]');
      if (targetButton) {
        const targetView = targetButton.dataset.target;
        this.showView(targetView);
      }
    });
  }

  showView(viewName) {
    // Normaliza o nome da view (remove '-view' se existir)
    const normalizedName = viewName.replace('-view', '');

    if (!this.views[normalizedName]) return;

    Object.values(this.views).forEach(v => v?.classList.add('hidden'));
    this.views[normalizedName].classList.remove('hidden');
    this.currentView = normalizedName;
    chrome.storage.local.set({ currentView: this.currentView });
  }

  async loadSavedView() {
    const result = await chrome.storage.local.get(['currentView']);
    const savedView = result.currentView || 'main';
    this.showView(savedView);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.navigationManager = new NavigationManager();
});
