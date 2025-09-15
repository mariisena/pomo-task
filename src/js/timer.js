/**
 * Gerencia a lógica do timer Pomodoro
 * Compatível com Manifest V3
 */

class PomodoroTimer {
    constructor() {
        this.state = {
            mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
            timeLeft: 25 * 60, // em segundos
            isRunning: false,
            currentRound: 1,
            totalRounds: 4,
            settings: {
                focusDuration: 25,
                shortBreakDuration: 5,
                longBreakDuration: 15,
                rounds: 4,
                soundAlert: false,
                autoCheck: false
            }
        };

        this.intervalId = null;
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
        // Elementos da view principal
        this.elements.mainMode = document.getElementById('mode-display');
        this.elements.mainTimer = document.getElementById('timer-display');
        this.elements.mainRound = document.getElementById('round-display');
        this.elements.mainStart = document.getElementById('main-start-btn');
        this.elements.mainPause = document.getElementById('main-pause-btn');
        this.elements.mainReset = document.getElementById('main-reset-btn');

        // Elementos da mini view
        this.elements.miniMode = document.getElementById('mini-mode-display');
        this.elements.miniTimer = document.getElementById('mini-timer-display');
        this.elements.miniRound = document.getElementById('mini-round-display');
        this.elements.miniStart = document.getElementById('mini-start-btn');
        this.elements.miniPause = document.getElementById('mini-pause-btn');
        this.elements.miniReset = document.getElementById('mini-reset-btn');
        this.elements.progressRing = document.getElementById('mini-progress-ring');
    }

    bindEvents() {
        // Botões da view principal
        if (this.elements.mainStart) {
            this.elements.mainStart.addEventListener('click', () => this.start());
        }
        if (this.elements.mainPause) {
            this.elements.mainPause.addEventListener('click', () => this.pause());
        }
        if (this.elements.mainReset) {
            this.elements.mainReset.addEventListener('click', () => this.reset());
        }

        // Botões da mini view
        if (this.elements.miniStart) {
            this.elements.miniStart.addEventListener('click', () => this.start());
        }
        if (this.elements.miniPause) {
            this.elements.miniPause.addEventListener('click', () => this.pause());
        }
        if (this.elements.miniReset) {
            this.elements.miniReset.addEventListener('click', () => this.reset());
        }

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return; // Não interferir em inputs

            switch (e.key) {
                case ' ': // Espaço para play/pause
                    e.preventDefault();
                    this.isRunning ? this.pause() : this.start();
                    break;
                case 'r': // R para reset
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.reset();
                    }
                    break;
            }
        });
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateButtonStates();

        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        this.announce(`Timer iniciado - ${this.getModeText()}`);
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.updateButtonStates();

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.announce('Timer pausado');
    }

    reset() {
        this.pause();
        this.resetCurrentMode();
        this.updateDisplay();
        this.announce(`Timer resetado - ${this.getModeText()}`);
    }

    tick() {
        this.state.timeLeft--;
        this.updateDisplay();

        if (this.state.timeLeft <= 0) {
            this.completeCurrentMode();
        }
    }

    completeCurrentMode() {
        this.pause();

        if (this.state.soundAlert) {
            this.playNotificationSound();
        }

        // Determinar próximo modo
        if (this.state.mode === 'focus') {
            if (this.state.currentRound >= this.state.totalRounds) {
                // Pausa longa após completar todas as rodadas
                this.switchMode('longBreak');
                this.state.currentRound = 1;
            } else {
                // Pausa curta
                this.switchMode('shortBreak');
            }
        } else {
            // Voltar para foco
            this.switchMode('focus');
            if (this.state.mode === 'focus') {
                this.state.currentRound++;
            }
        }

        this.updateDisplay();
        this.announce(`${this.getModeText()} concluído! Próximo: ${this.getModeText()}`);

        // Auto-marcar tarefas se habilitado
        if (this.state.settings.autoCheck && this.state.mode === 'focus') {
            this.autoCheckTasks();
        }
    }

    switchMode(newMode) {
        this.state.mode = newMode;
        this.resetCurrentMode();
    }

    resetCurrentMode() {
        const durations = {
            focus: this.state.settings.focusDuration,
            shortBreak: this.state.settings.shortBreakDuration,
            longBreak: this.state.settings.longBreakDuration
        };

        this.state.timeLeft = durations[this.state.mode] * 60;
    }

    updateDisplay() {
        const timeString = this.formatTime(this.state.timeLeft);
        const modeText = this.getModeText();
        const roundText = `Round: ${this.state.currentRound} / ${this.state.totalRounds}`;

        // Atualizar elementos principais
        if (this.elements.mainMode) this.elements.mainMode.textContent = modeText;
        if (this.elements.mainTimer) this.elements.mainTimer.textContent = timeString;
        if (this.elements.mainRound) this.elements.mainRound.textContent = roundText;

        // Atualizar mini view
        if (this.elements.miniMode) this.elements.miniMode.textContent = modeText;
        if (this.elements.miniTimer) this.elements.miniTimer.textContent = timeString;
        if (this.elements.miniRound) this.elements.miniRound.textContent = roundText;

        // Atualizar progresso circular
        this.updateProgressRing();

        // Atualizar título da página
        document.title = `${timeString} - ${modeText} - Pomo Tasks`;

        // Adicionar efeito visual quando tempo está acabando
        if (this.state.timeLeft <= 60 && this.isRunning) {
            this.elements.mainTimer?.classList.add('pulsing');
            this.elements.miniTimer?.classList.add('pulsing');
        } else {
            this.elements.mainTimer?.classList.remove('pulsing');
            this.elements.miniTimer?.classList.remove('pulsing');
        }
    }

    updateProgressRing() {
        if (!this.elements.progressRing) return;

        const totalTime = this.getTotalTimeForCurrentMode();
        const progress = (totalTime - this.state.timeLeft) / totalTime;
        const circumference = 327; // 2 * PI * 52
        const offset = circumference - (progress * circumference);

        this.elements.progressRing.style.strokeDashoffset = offset;
    }

    getTotalTimeForCurrentMode() {
        const durations = {
            focus: this.state.settings.focusDuration,
            shortBreak: this.state.settings.shortBreakDuration,
            longBreak: this.state.settings.longBreakDuration
        };

        return durations[this.state.mode] * 60;
    }

    updateButtonStates() {
        const startButtons = [this.elements.mainStart, this.elements.miniStart];
        const pauseButtons = [this.elements.mainPause, this.elements.miniPause];

        startButtons.forEach(btn => {
            if (btn) {
                btn.disabled = this.isRunning;
                btn.setAttribute('aria-pressed', this.isRunning.toString());
            }
        });

        pauseButtons.forEach(btn => {
            if (btn) {
                btn.disabled = !this.isRunning;
                btn.setAttribute('aria-pressed', (!this.isRunning).toString());
            }
        });
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getModeText() {
        const modeTexts = {
            focus: 'Focus',
            shortBreak: 'Pausa Curta',
            longBreak: 'Pausa Longa'
        };

        return modeTexts[this.state.mode] || 'Focus';
    }

    playNotificationSound() {
        // Criar um som simples usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Não foi possível reproduzir som de notificação:', error);
        }
    }

    autoCheckTasks() {
        // Integração com o sistema de tarefas
        if (window.taskManager) {
            window.taskManager.autoCheckFirstIncompleteTask();
        }
    }

    announce(message) {
        // Criar anúncio para leitores de tela
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;

        document.body.appendChild(announcer);

        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }

    // Métodos para integração com configurações
    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.state.totalRounds = this.state.settings.rounds;

        // Se não estiver rodando, atualizar tempo atual
        if (!this.isRunning) {
            this.resetCurrentMode();
            this.updateDisplay();
        }

        this.saveSettings();
    }

    async saveSettings() {
        try {
            await chrome.storage.local.set({
                timerSettings: this.state.settings,
                timerState: {
                    mode: this.state.mode,
                    currentRound: this.state.currentRound,
                    totalRounds: this.state.totalRounds
                }
            });
        } catch (error) {
            // Fallback para localStorage
            localStorage.setItem('pomoTasks_timerSettings', JSON.stringify(this.state.settings));
            localStorage.setItem('pomoTasks_timerState', JSON.stringify({
                mode: this.state.mode,
                currentRound: this.state.currentRound,
                totalRounds: this.state.totalRounds
            }));
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['timerSettings', 'timerState']);

            if (result.timerSettings) {
                this.state.settings = { ...this.state.settings, ...result.timerSettings };
            }

            if (result.timerState) {
                this.state.mode = result.timerState.mode || 'focus';
                this.state.currentRound = result.timerState.currentRound || 1;
                this.state.totalRounds = result.timerState.totalRounds || 4;
            }
        } catch (error) {
            // Fallback para localStorage
            const savedSettings = localStorage.getItem('pomoTasks_timerSettings');
            const savedState = localStorage.getItem('pomoTasks_timerState');

            if (savedSettings) {
                this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
            }

            if (savedState) {
                const state = JSON.parse(savedState);
                this.state.mode = state.mode || 'focus';
                this.state.currentRound = state.currentRound || 1;
                this.state.totalRounds = state.totalRounds || 4;
            }
        }

        this.resetCurrentMode();
        this.updateDisplay();
    }

    // Método público para obter estado atual
    getState() {
        return { ...this.state };
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
});

// Exportar para uso em outros módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PomodoroTimer;
}