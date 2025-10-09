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
    this.bindEvents();
    this.loadSavedView();
  }

  bindEvents() {
    const openSettingsBtn = document.getElementById('open-settings');
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => this.showView('settings'));
    }

    const backToMainBtn = document.getElementById('back-to-main');
    if (backToMainBtn) {
      backToMainBtn.addEventListener('click', () => this.showView('main'));
    }
  }

  showView(viewName) {
    if (!this.views[viewName]) return;

    Object.values(this.views).forEach(v => v?.classList.add('hidden'));
    this.views[viewName].classList.remove('hidden');
    this.currentView = viewName;
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
