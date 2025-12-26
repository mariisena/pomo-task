// PomodoroTimer.js - controla o timer
class PomodoroTimer {
    constructor() {
        this.state = {
            mode: 'focus',
            timeLeft: 25 * 60,
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
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
        this.setupStorageListener();
    }

    cacheElements() {
        this.modeEl = document.getElementById('mode-display');
        this.timerEl = document.getElementById('timer-display');
        this.roundEl = document.getElementById('round-display');
        // Suporta ambas janelas: popup principal (main-*-btn) e timer-window (*-btn)
        this.startBtn = document.getElementById('main-start-btn') || document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('main-pause-btn') || document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('main-reset-btn') || document.getElementById('reset-btn');
        // Progress ring SVG (apenas em timer-window)
        this.progressRing = document.getElementById('progress-ring');
        this.progressRingCircumference = this.progressRing ? 2 * Math.PI * 52 : 0;
        if (this.progressRing) {
            this.progressRing.style.strokeDasharray = `${this.progressRingCircumference} ${this.progressRingCircumference}`;
            this.progressRing.style.strokeDashoffset = 0;
        }
    }

    bindEvents() {
        this.startBtn?.addEventListener('click', () => this.start());
        this.pauseBtn?.addEventListener('click', () => this.pause());
        this.resetBtn?.addEventListener('click', () => this.reset());
    }

    start() {
        if (this.state.isRunning) return;
        this.state.isRunning = true;
        this.intervalId = setInterval(() => this.tick(), 1000);
    }

    pause() {
        this.state.isRunning = false;
        clearInterval(this.intervalId);
    }

    reset() {
        this.state.isRunning = false;
        clearInterval(this.intervalId);
        this.state.mode = 'focus';
        this.state.currentRound = 1;
        this.state.timeLeft = this.state.settings.focusDuration * 60;
        this.updateDisplay();
        this.saveState();
    }

    tick() {
        if (this.state.timeLeft > 0) {
            this.state.timeLeft--;
            this.updateDisplay();
            this.saveState();
        } else {
            this.completeSession();
        }
    }

    completeSession() {
        this.pause();

        // Enviar notificação e tocar som
        let message = '';
        let isEnteringBreak = false; // Flag para saber se estamos entrando em uma pausa

        if (this.state.mode === 'focus') {
            if (this.state.currentRound >= this.state.settings.rounds) {
                message = '🎉 Ciclo completo! Hora do intervalo longo!';
                this.state.mode = 'longBreak';
                this.state.currentRound = 1;
                this.state.timeLeft = this.state.settings.longBreakDuration * 60;
                this.incrementCompletedCycles();
                isEnteringBreak = true;
            } else {
                message = '✅ Foco concluído! Hora do intervalo curto!';
                this.state.mode = 'shortBreak';
                this.state.currentRound++;
                this.state.timeLeft = this.state.settings.shortBreakDuration * 60;
                isEnteringBreak = true;
            }
        } else {
            message = '💪 Intervalo terminado! Vamos focar novamente!';
            this.state.mode = 'focus';
            this.state.timeLeft = this.state.settings.focusDuration * 60;
        }

        // Auto-completar tarefas se configurado e estamos entrando em uma pausa
        if (this.state.settings.autoCheck && isEnteringBreak) {
            if (window.taskManager) {
                window.taskManager.autoCompleteAllIncompleteTasks();
            }
        }

        // Enviar mensagem para service worker
        chrome.runtime.sendMessage({
            type: 'notify',
            message: message
        });

        // Tocar som se configurado
        if (this.state.settings.soundAlert) {
            chrome.runtime.sendMessage({ type: 'playSound' });
        }

        this.updateDisplay();
        this.saveState();
    }

    updateDisplay() {
        const modeTranslations = {
            focus: 'Foco',
            shortBreak: 'Pausa Curta',
            longBreak: 'Pausa Longa'
        };

        if (this.modeEl) this.modeEl.textContent = modeTranslations[this.state.mode] || this.state.mode;
        if (this.timerEl) {
            const m = Math.floor(this.state.timeLeft / 60).toString().padStart(2, '0');
            const s = (this.state.timeLeft % 60).toString().padStart(2, '0');
            this.timerEl.textContent = `${m}:${s}`;
        }
        if (this.roundEl) this.roundEl.textContent = `Round: ${this.state.currentRound} / ${this.state.settings.rounds}`;

        // Atualizar progress ring
        this.updateProgressRing();

        // Adicionar classe visual quando timer está rodando
        if (this.timerEl) {
            if (this.state.isRunning) {
                this.timerEl.classList.add('timer-running');
            } else {
                this.timerEl.classList.remove('timer-running');
            }
        }
    }

    async loadSettings() {
        const result = await chrome.storage.local.get(['timerSettings', 'timerState']);
        if (result.timerSettings) {
            this.state.settings = { ...this.state.settings, ...result.timerSettings };
            this.state.totalRounds = this.state.settings.rounds;
        }
        // Restaurar estado do timer se existir
        if (result.timerState) {
            this.state.mode = result.timerState.mode || 'focus';
            this.state.timeLeft = result.timerState.timeLeft || this.state.settings.focusDuration * 60;
            this.state.currentRound = result.timerState.currentRound || 1;
            this.state.isRunning = false; // Sempre inicia pausado ao carregar
        } else {
            this.state.timeLeft = this.state.settings.focusDuration * 60;
        }
        this.updateDisplay();
    }

    async saveState() {
        await chrome.storage.local.set({
            timerState: {
                mode: this.state.mode,
                timeLeft: this.state.timeLeft,
                currentRound: this.state.currentRound,
                isRunning: this.state.isRunning
            }
        });
    }

    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.state.totalRounds = this.state.settings.rounds;
        if (!this.state.isRunning) {
            this.state.timeLeft = this.state.settings.focusDuration * 60;
            this.updateDisplay();
        }
        chrome.storage.local.set({ timerSettings: this.state.settings });
    }

    async incrementCompletedCycles() {
        const result = await chrome.storage.local.get(['completedCycles']);
        const cycles = result.completedCycles || [];
        cycles.push({
            date: new Date().toISOString(),
            rounds: this.state.settings.rounds
        });
        await chrome.storage.local.set({ completedCycles: cycles });
    }

    updateProgressRing() {
        if (!this.progressRing) return;

        const totalTime = this.state.mode === 'focus'
            ? this.state.settings.focusDuration * 60
            : this.state.mode === 'shortBreak'
            ? this.state.settings.shortBreakDuration * 60
            : this.state.settings.longBreakDuration * 60;

        const progress = 1 - (this.state.timeLeft / totalTime);
        const circumference = 2 * Math.PI * 52; // raio = 52
        const offset = circumference * (1 - progress);

        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing.style.strokeDashoffset = offset;
    }

    setupStorageListener() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace !== 'local') return;

            // Sincronizar estado do timer entre janelas
            if (changes.timerState && !this.state.isRunning) {
                const newState = changes.timerState.newValue;
                if (newState) {
                    this.state.mode = newState.mode;
                    this.state.timeLeft = newState.timeLeft;
                    this.state.currentRound = newState.currentRound;
                    this.updateDisplay();
                }
            }

            // Sincronizar configurações
            if (changes.timerSettings) {
                const newSettings = changes.timerSettings.newValue;
                if (newSettings && !this.state.isRunning) {
                    this.state.settings = { ...this.state.settings, ...newSettings };
                    this.state.totalRounds = this.state.settings.rounds;
                    this.updateDisplay();
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
});
