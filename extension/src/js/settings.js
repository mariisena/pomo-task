// Settings.js - Gerencia configurações
class SettingsManager {
    constructor() {
        this.settings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            rounds: 4,
            soundAlert: false,
            autoCheck: false,
            miniWindow: false
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
            this.elements.focusDuration.addEventListener('change', () => this.saveAndApplySettings());
        }

        if (this.elements.shortBreakDuration) {
            this.elements.shortBreakDuration.addEventListener('input', (e) => {
                this.settings.shortBreakDuration = parseInt(e.target.value);
                if (this.elements.shortBreakValue) {
                    this.elements.shortBreakValue.textContent = `${e.target.value} min`;
                }
            });
            this.elements.shortBreakDuration.addEventListener('change', () => this.saveAndApplySettings());
        }

        if (this.elements.longBreakDuration) {
            this.elements.longBreakDuration.addEventListener('input', (e) => {
                this.settings.longBreakDuration = parseInt(e.target.value);
                if (this.elements.longBreakValue) {
                    this.elements.longBreakValue.textContent = `${e.target.value} min`;
                }
            });
            this.elements.longBreakDuration.addEventListener('change', () => this.saveAndApplySettings());
        }

        if (this.elements.rounds) {
            this.elements.rounds.addEventListener('input', (e) => {
                this.settings.rounds = parseInt(e.target.value);
                if (this.elements.roundsValue) {
                    this.elements.roundsValue.textContent = e.target.value;
                }
            });
            this.elements.rounds.addEventListener('change', () => this.saveAndApplySettings());
        }

        // Toggles
        if (this.elements.soundAlertToggle) {
            this.elements.soundAlertToggle.addEventListener('click', () => {
                this.settings.soundAlert = !this.settings.soundAlert;
                this.updateToggleUI(this.elements.soundAlertToggle, this.settings.soundAlert);
                this.saveAndApplySettings();
            });
        }

        if (this.elements.autoCheckToggle) {
            this.elements.autoCheckToggle.addEventListener('click', () => {
                this.settings.autoCheck = !this.settings.autoCheck;
                this.updateToggleUI(this.elements.autoCheckToggle, this.settings.autoCheck);
                this.saveAndApplySettings();
            });
        }

        if (this.elements.confirmBtn) {
            this.elements.confirmBtn.addEventListener('click', async () => {
                await this.saveAndApplySettings();

                // Feedback visual
                this.elements.confirmBtn.textContent = '✓ SALVO!';
                this.elements.confirmBtn.style.backgroundColor = '#10b981';

                // Voltar para a tela principal após 500ms
                setTimeout(() => {
                    if (window.navigationManager) {
                        window.navigationManager.showView('main');
                    }
                    // Restaurar texto do botão
                    this.elements.confirmBtn.textContent = 'CONFIRMAR';
                    this.elements.confirmBtn.style.backgroundColor = '';
                }, 500);
            });
        }
    }

    updateToggleUI(toggleEl, isActive) {
        if (!toggleEl) return;
        toggleEl.setAttribute('aria-checked', isActive);
        if (isActive) {
            toggleEl.classList.add('active');
        } else {
            toggleEl.classList.remove('active');
        }
    }

    async saveAndApplySettings() {
        await chrome.storage.local.set({ timerSettings: this.settings });
        if (window.pomodoroTimer) {
            window.pomodoroTimer.updateSettings(this.settings);
        }
    }

    async loadSettings() {
        const result = await chrome.storage.local.get(['timerSettings']);
        if (result.timerSettings) {
            this.settings = { ...this.settings, ...result.timerSettings };
        }
        this.updateUI();
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
