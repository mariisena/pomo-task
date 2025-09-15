/**
 * Settings.js - Gerencia as configurações da extensão
 * Compatível com Manifest V3
 */

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
        this.updateDisplay();
    }

    cacheElements() {
        this.elements = {
            focusDuration: document.getElementById('focus-duration'),
            shortBreakDuration: document.getElementById('short-break-duration'),
            longBreakDuration: document.getElementById('long-break-duration'),
            rounds: document.getElementById('rounds'),
            focusValue: document.getElementById('focus-value'),
            shortBreakValue: document.getElementById('short-break-value'),
            longBreakValue: document.getElementById('long-break-value'),
            roundsValue: document.getElementById('rounds-value'),
            soundAlertToggle: document.getElementById('sound-alert-toggle'),
            autoCheckToggle: document.getElementById('auto-check-toggle'),
            miniWindowToggle: document.getElementById('mini-window-toggle'),
            confirmBtn: document.getElementById('confirm-settings-btn')
        };
    }

    bindEvents() {
        ['focusDuration', 'shortBreakDuration', 'longBreakDuration', 'rounds'].forEach(key => {
            const input = this.elements[key];
            if (input) {
                input.addEventListener('input', e => {
                    this.updateRangeValue(key, parseInt(e.target.value));
                });
                input.addEventListener('change', () => this.autoSave());
            }
        });

        ['soundAlert', 'autoCheck', 'miniWindow'].forEach(key => {
            const toggle = this.elements[`${key}Toggle`];
            if (toggle) {
                toggle.addEventListener('click', () => this.toggleSetting(key));
            }
        });

        if (this.elements.confirmBtn) {
            this.elements.confirmBtn.addEventListener('click', () => this.saveAndApplySettings());
        }

        document.addEventListener('keydown', e => {
            if (e.target.closest('#settings-view') && e.key === 'Enter' && e.target.type === 'range') {
                this.saveAndApplySettings();
            }
        });
    }

    updateRangeValue(settingName, value) {
        this.settings[settingName] = value;
        this.updateValueDisplay(settingName, value);
        this.validateSettings();
    }

    updateValueDisplay(settingName, value) {
        const display = this.elements[`${settingName.replace('Duration', '')}Value`] || this.elements[`${settingName}Value`];
        if (!display) return;

        display.textContent = settingName === 'rounds' ? `${value}` : `${value} min`;
        display.setAttribute('aria-live', 'polite');
    }

    toggleSetting(settingName) {
        this.settings[settingName] = !this.settings[settingName];
        this.updateToggleDisplay(settingName);
        this.autoSave();
        if (settingName === 'miniWindow') this.applyMiniWindowSetting();
    }

    updateToggleDisplay(settingName) {
        const element = this.elements[`${settingName}Toggle`];
        if (!element) return;

        const isActive = this.settings[settingName];
        element.setAttribute('aria-checked', isActive);
        element.classList.toggle('is-active', isActive);

        const labels = {
            soundAlert: 'Alerta Sonoro',
            autoCheck: 'Verificação Automática de Tarefas',
            miniWindow: 'Janela Pequena'
        };

        this.announce(`${labels[settingName]} ${isActive ? 'ativado' : 'desativado'}`);
    }

    validateSettings() {
        const s = this.settings;
        s.focusDuration = Math.max(5, s.focusDuration);
        s.shortBreakDuration = Math.max(1, s.shortBreakDuration);
        s.longBreakDuration = Math.max(s.shortBreakDuration + 5, s.longBreakDuration);
        s.rounds = Math.max(1, s.rounds);
        this.updateDisplay();
    }

    updateDisplay() {
        ['focusDuration', 'shortBreakDuration', 'longBreakDuration', 'rounds'].forEach(key => {
            if (this.elements[key]) this.elements[key].value = this.settings[key];
            this.updateValueDisplay(key, this.settings[key]);
        });

        ['soundAlert', 'autoCheck', 'miniWindow'].forEach(key => this.updateToggleDisplay(key));
    }

    async saveAndApplySettings() {
        this.validateSettings();
        await this.saveSettings();
        this.applySettings();
        this.announce('Configurações salvas e aplicadas');

        if (window.navigationManager) {
            setTimeout(() => window.navigationManager.showView('main'), 500);
        }
    }

    async autoSave() {
        this.validateSettings();
        await this.saveSettings();
    }

    applySettings() {
        if (window.pomodoroTimer) {
            window.pomodoroTimer.updateSettings(this.settings);
        }
        this.applyMiniWindowSetting();
    }

    applyMiniWindowSetting() {
        if (this.settings.miniWindow && window.navigationManager) {
            window.navigationManager.toggleMiniView(true);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.local.set({ settings: this.settings });
        } catch (error) {
            localStorage.setItem('pomoTasks_settings', JSON.stringify(this.settings));
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            if (result.settings) {
                this.settings = { ...this.settings, ...result.settings };
            }
        } catch (error) {
            const saved = localStorage.getItem('pomoTasks_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        }
    }

    applyPreset(presetName) {
        const presets = {
            classic: { focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, rounds: 4 },
            short: { focusDuration: 15, shortBreakDuration: 3, longBreakDuration: 10, rounds: 6 },
            long: { focusDuration: 45, shortBreakDuration: 10, longBreakDuration: 30, rounds: 3 },
            custom: { focusDuration: 30, shortBreakDuration: 7, longBreakDuration: 20, rounds: 4 }
        };

        const preset = presets[presetName];
        if (!preset) return;

        Object.assign(this.settings, preset);
        this.updateDisplay();
        this.announce(`Preset "${presetName}" aplicado`);
    }

    resetToDefaults() {
        this.settings = {
            focusDuration: 25,
            shortBreakDuration: 10,
            longBreakDuration: 30,
            rounds: 4,
            soundAlert: false,
            autoCheck: false,
            miniWindow: false
        };
        this.updateDisplay();
        this.announce('Configurações resetadas para o padrão');
    }

    exportSettings() {
        return {
            settings: this.settings,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    importSettings(data) {
        if (!data.settings) throw new Error('Formato de dados inválido');
        this.settings = { ...this.settings, ...data.settings };
        this.updateDisplay();
        this.announce('Configurações importadas');
    }

    announce(message) {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;
        document.body.appendChild(announcer);
        setTimeout(() => announcer.remove(), 1000);
    }

    getSettings() {
        return { ...this.settings };
    }

    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.updateDisplay();
            this.autoSave();
        }
    }

    validateImportedSettings(settings) {
        const valid = {};
        for (const key in this.settings) {
            if (settings.hasOwnProperty(key) && typeof settings[key] === typeof this.settings[key]) {
                valid[key] = settings[key];
            }
        }
        return valid;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
}
