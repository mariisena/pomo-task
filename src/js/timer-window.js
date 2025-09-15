/**
 * Timer Window - Interface dedicada para o timer Pomodoro
 * Funciona em janela separada para melhor experiência do usuário
 */

class TimerWindow {
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
                soundAlert: false
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
        this.updateProgressRing();
    }

    cacheElements() {
        this.elements.modeDisplay = document.getElementById('mode-display');
        this.elements.timerDisplay = document.getElementById('timer-display');
        this.elements.roundDisplay = document.getElementById('round-display');
        this.elements.startBtn = document.getElementById('start-btn');
        this.elements.pauseBtn = document.getElementById('pause-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');
        this.elements.settingsBtn = document.getElementById('settings-btn');
        this.elements.tasksBtn = document.getElementById('tasks-btn');
        this.elements.progressRing = document.getElementById('progress-ring');
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.tasksBtn.addEventListener('click', () => this.openTasks());

        // Escutar mudanças de configuração da janela principal
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'settingsUpdated') {
                this.loadSettings();
                this.updateDisplay();
            }
        });
    }

    start() {
        if (!this.state.isRunning) {
            this.state.isRunning = true;
            this.intervalId = setInterval(() => this.tick(), 1000);
            this.updateButtons();
        }
    }

    pause() {
        if (this.state.isRunning) {
            this.state.isRunning = false;
            clearInterval(this.intervalId);
            this.updateButtons();
        }
    }

    reset() {
        this.state.isRunning = false;
        clearInterval(this.intervalId);
        this.resetTimer();
        this.updateDisplay();
        this.updateButtons();
        this.updateProgressRing();
    }

    tick() {
        if (this.state.timeLeft > 0) {
            this.state.timeLeft--;
            this.updateDisplay();
            this.updateProgressRing();
        } else {
            this.completeSession();
        }
    }

    completeSession() {
        this.state.isRunning = false;
        clearInterval(this.intervalId);

        // Tocar som se habilitado
        if (this.state.settings.soundAlert) {
            this.playNotificationSound();
        }

        // Mostrar notificação
        this.showNotification();

        // Avançar para próxima sessão
        this.nextSession();
    }

    nextSession() {
        if (this.state.mode === 'focus') {
            this.state.currentRound++;
            
            if (this.state.currentRound > this.state.settings.rounds) {
                // Ciclo completo
                this.state.mode = 'longBreak';
                this.state.timeLeft = this.state.settings.longBreakDuration * 60;
                this.state.currentRound = 1;
            } else {
                // Pausa curta
                this.state.mode = 'shortBreak';
                this.state.timeLeft = this.state.settings.shortBreakDuration * 60;
            }
        } else {
            // Voltar para foco
            this.state.mode = 'focus';
            this.state.timeLeft = this.state.settings.focusDuration * 60;
        }

        this.updateDisplay();
        this.updateButtons();
        this.updateProgressRing();
    }

    resetTimer() {
        this.state.mode = 'focus';
        this.state.timeLeft = this.state.settings.focusDuration * 60;
        this.state.currentRound = 1;
    }

    updateDisplay() {
        // Modo
        const modeText = {
            'focus': 'Focus',
            'shortBreak': 'Pausa Curta',
            'longBreak': 'Pausa Longa'
        };
        this.elements.modeDisplay.textContent = modeText[this.state.mode];

        // Timer
        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;
        this.elements.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Round
        this.elements.roundDisplay.textContent = 
            `Round: ${this.state.currentRound} / ${this.state.settings.rounds}`;
    }

    updateButtons() {
        if (this.state.isRunning) {
            this.elements.startBtn.style.display = 'none';
            this.elements.pauseBtn.style.display = 'inline-block';
        } else {
            this.elements.startBtn.style.display = 'inline-block';
            this.elements.pauseBtn.style.display = 'none';
        }
    }

    updateProgressRing() {
        const totalTime = this.getTotalTimeForMode();
        const progress = (totalTime - this.state.timeLeft) / totalTime;
        const circumference = 2 * Math.PI * 52; // raio = 52
        const offset = circumference - (progress * circumference);
        
        this.elements.progressRing.style.strokeDashoffset = offset;
    }

    getTotalTimeForMode() {
        switch (this.state.mode) {
            case 'focus':
                return this.state.settings.focusDuration * 60;
            case 'shortBreak':
                return this.state.settings.shortBreakDuration * 60;
            case 'longBreak':
                return this.state.settings.longBreakDuration * 60;
            default:
                return 25 * 60;
        }
    }

    loadSettings() {
        chrome.storage.sync.get(['pomoSettings'], (result) => {
            if (result.pomoSettings) {
                this.state.settings = { ...this.state.settings, ...result.pomoSettings };
                this.resetTimer();
                this.updateDisplay();
                this.updateProgressRing();
            }
        });
    }

    showNotification() {
        const messages = {
            'focus': 'Tempo de foco concluído! Hora da pausa.',
            'shortBreak': 'Pausa curta finalizada! Vamos focar novamente.',
            'longBreak': 'Pausa longa finalizada! Novo ciclo começando.'
        };

        chrome.runtime.sendMessage({
            type: 'notify',
            message: messages[this.state.mode]
        });
    }

    playNotificationSound() {
        // Som será tocado pelo service worker via offscreen
        chrome.runtime.sendMessage({
            type: 'playSound'
        });
    }

    openSettings() {
        chrome.runtime.sendMessage({
            type: 'openPopup',
            view: 'settings'
        });
    }

    openTasks() {
        chrome.runtime.sendMessage({
            type: 'openPopup',
            view: 'tasks'
        });
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new TimerWindow();
});
