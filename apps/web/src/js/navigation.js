// NavigationManager.js - Gerencia navegação entre views (adaptado para PWA)
class NavigationManager {
    constructor() {
        this.currentView = 'main';
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadCurrentView();
        this.navigateTo(this.currentView);
    }

    cacheElements() {
        this.elements = {
            mainView: document.getElementById('main-view'),
            settingsView: document.getElementById('settings-view'),
            settingsBtn: document.getElementById('settings-btn'),
            backToMainBtn: document.getElementById('back-to-main')
        };
    }

    bindEvents() {
        // Botão de configurações
        this.elements.settingsBtn?.addEventListener('click', () => {
            this.navigateTo('settings');
        });

        // Botão voltar
        this.elements.backToMainBtn?.addEventListener('click', () => {
            this.navigateTo('main');
        });

        // Event delegation para botões com data-target
        document.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('[data-target]');
            if (targetBtn) {
                const target = targetBtn.dataset.target;
                this.navigateTo(target);
            }
        });
    }

    navigateTo(view) {
        // Esconder todas as views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });

        // Mostrar view solicitada
        const targetView = view === 'settings' ? this.elements.settingsView : this.elements.mainView;

        if (targetView) {
            targetView.classList.add('active');
            this.currentView = view;
            this.saveCurrentView();
        }
    }

    saveCurrentView() {
        try {
            localStorage.setItem('currentView', this.currentView);
        } catch (err) {
            console.error('Erro ao salvar view atual:', err);
        }
    }

    loadCurrentView() {
        try {
            const saved = localStorage.getItem('currentView');
            if (saved) {
                this.currentView = saved;
            }
        } catch (err) {
            console.error('Erro ao carregar view:', err);
        }
    }
}

export default NavigationManager;
