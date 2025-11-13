// SettingsManager.js - Gerencia configurações (adaptado para PWA)
class SettingsManager {
    constructor(pomodoroTimer) {
        this.pomodoroTimer = pomodoroTimer;
        this.settings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            rounds: 4,
            soundAlert: false,
            autoCheck: false
        };
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
    }

    cacheElements() {
        this.elements = {
            focusDuration: document.getElementById('focus-duration'),
            shortBreakDuration: document.getElementById('short-break-duration'),
            longBreakDuration: document.getElementById('long-break-duration'),
            rounds: document.getElementById('rounds'),
            soundAlertToggle: document.getElementById('sound-alert-toggle'),
            autoCheckToggle: document.getElementById('auto-check-toggle'),
            confirmBtn: document.getElementById('confirm-settings-btn'),
            focusValue: document.getElementById('focus-value'),
            shortBreakValue: document.getElementById('short-break-value'),
            longBreakValue: document.getElementById('long-break-value'),
            roundsValue: document.getElementById('rounds-value')
        };
    }

    bindEvents() {
        // Ranges com feedback visual
        if (this.elements.focusDuration) {
            this.elements.focusDuration.addEventListener('input', (e) => {
                this.settings.focusDuration = parseInt(e.target.value);
                if (this.elements.focusValue) {
                    this.elements.focusValue.textContent = `${e.target.value} min`;
                }
            });
        }

        if (this.elements.shortBreakDuration) {
            this.elements.shortBreakDuration.addEventListener('input', (e) => {
                this.settings.shortBreakDuration = parseInt(e.target.value);
                if (this.elements.shortBreakValue) {
                    this.elements.shortBreakValue.textContent = `${e.target.value} min`;
                }
            });
        }

        if (this.elements.longBreakDuration) {
            this.elements.longBreakDuration.addEventListener('input', (e) => {
                this.settings.longBreakDuration = parseInt(e.target.value);
                if (this.elements.longBreakValue) {
                    this.elements.longBreakValue.textContent = `${e.target.value} min`;
                }
            });
        }

        if (this.elements.rounds) {
            this.elements.rounds.addEventListener('input', (e) => {
                this.settings.rounds = parseInt(e.target.value);
                if (this.elements.roundsValue) {
                    this.elements.roundsValue.textContent = e.target.value;
                }
            });
        }

        // Toggles
        if (this.elements.soundAlertToggle) {
            this.elements.soundAlertToggle.addEventListener('click', () => {
                this.settings.soundAlert = !this.settings.soundAlert;
                this.updateToggleUI(this.elements.soundAlertToggle, this.settings.soundAlert);
            });
        }

        if (this.elements.autoCheckToggle) {
            this.elements.autoCheckToggle.addEventListener('click', () => {
                this.settings.autoCheck = !this.settings.autoCheck;
                this.updateToggleUI(this.elements.autoCheckToggle, this.settings.autoCheck);
            });
        }

        // Botão confirmar
        if (this.elements.confirmBtn) {
            this.elements.confirmBtn.addEventListener('click', () => {
                this.saveAndApplySettings();
                // Voltar para tela principal
                if (window.navigationManager) {
                    window.navigationManager.navigateTo('main');
                }
            });
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('timerSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            this.updateUI();
        } catch (err) {
            console.error('Erro ao carregar configurações:', err);
        }
    }

    saveAndApplySettings() {
        try {
            localStorage.setItem('timerSettings', JSON.stringify(this.settings));

            // Atualizar timer se disponível
            if (this.pomodoroTimer) {
                this.pomodoroTimer.updateSettings(this.settings);
            }

            console.log('Configurações salvas com sucesso');
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
        }
    }

    updateUI() {
        // Atualizar valores dos ranges
        if (this.elements.focusDuration) {
            this.elements.focusDuration.value = this.settings.focusDuration;
            if (this.elements.focusValue) {
                this.elements.focusValue.textContent = `${this.settings.focusDuration} min`;
            }
        }

        if (this.elements.shortBreakDuration) {
            this.elements.shortBreakDuration.value = this.settings.shortBreakDuration;
            if (this.elements.shortBreakValue) {
                this.elements.shortBreakValue.textContent = `${this.settings.shortBreakDuration} min`;
            }
        }

        if (this.elements.longBreakDuration) {
            this.elements.longBreakDuration.value = this.settings.longBreakDuration;
            if (this.elements.longBreakValue) {
                this.elements.longBreakValue.textContent = `${this.settings.longBreakDuration} min`;
            }
        }

        if (this.elements.rounds) {
            this.elements.rounds.value = this.settings.rounds;
            if (this.elements.roundsValue) {
                this.elements.roundsValue.textContent = this.settings.rounds;
            }
        }

        // Atualizar toggles
        this.updateToggleUI(this.elements.soundAlertToggle, this.settings.soundAlert);
        this.updateToggleUI(this.elements.autoCheckToggle, this.settings.autoCheck);
    }

    updateToggleUI(toggleElement, isActive) {
        if (!toggleElement) return;

        toggleElement.setAttribute('aria-checked', isActive);
        if (isActive) {
            toggleElement.classList.add('active');
        } else {
            toggleElement.classList.remove('active');
        }
    }
}

export default SettingsManager;
