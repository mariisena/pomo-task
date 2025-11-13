// PomodoroTimer.js - Controla o timer (adaptado para PWA)
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
        this.apiUrl = import.meta.env.VITE_API_URL || '/api';
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
        this.requestNotificationPermission();
    }

    cacheElements() {
        this.modeEl = document.getElementById('mode-display');
        this.timerEl = document.getElementById('timer-display');
        this.roundEl = document.getElementById('round-display');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
    }

    bindEvents() {
        this.startBtn?.addEventListener('click', () => this.start());
        this.pauseBtn?.addEventListener('click', () => this.pause());
        this.resetBtn?.addEventListener('click', () => this.reset());
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    start() {
        if (this.state.isRunning) return;
        this.state.isRunning = true;
        this.intervalId = setInterval(() => this.tick(), 1000);
        this.updateDisplay();
    }

    pause() {
        this.state.isRunning = false;
        clearInterval(this.intervalId);
        this.saveState();
        this.updateDisplay();
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
            // Salvar estado a cada minuto ou quando pausado
            if (this.state.timeLeft % 60 === 0) {
                this.saveState();
            }
        } else {
            this.completeSession();
        }
    }

    async completeSession() {
        this.pause();

        let message = '';
        let title = 'PomoTask';

        if (this.state.mode === 'focus') {
            if (this.state.currentRound >= this.state.settings.rounds) {
                title = 'Ciclo Completo!';
                message = '🎉 Ciclo completo! Hora do intervalo longo!';
                this.state.mode = 'longBreak';
                this.state.currentRound = 1;
                this.state.timeLeft = this.state.settings.longBreakDuration * 60;
                await this.incrementCompletedCycles();
            } else {
                title = 'Foco Concluído!';
                message = '✅ Foco concluído! Hora do intervalo curto!';
                this.state.mode = 'shortBreak';
                this.state.currentRound++;
                this.state.timeLeft = this.state.settings.shortBreakDuration * 60;
            }
        } else {
            title = 'Intervalo Terminado!';
            message = '💪 Intervalo terminado! Vamos focar novamente!';
            this.state.mode = 'focus';
            this.state.timeLeft = this.state.settings.focusDuration * 60;
        }

        // Enviar notificação
        this.showNotification(title, message);

        // Tocar som se configurado
        if (this.state.settings.soundAlert) {
            this.playSound();
        }

        this.updateDisplay();
        this.saveState();
    }

    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-72.png',
                tag: 'pomodoro-notification',
                renotify: true,
                requireInteraction: false
            });

            // Auto-fechar após 5 segundos
            setTimeout(() => notification.close(), 5000);
        }
    }

    playSound() {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Erro ao tocar som:', err));
        } catch (err) {
            console.log('Erro ao criar áudio:', err);
        }
    }

    updateDisplay() {
        const modeTranslations = {
            focus: 'Foco',
            shortBreak: 'Pausa Curta',
            longBreak: 'Pausa Longa'
        };

        if (this.modeEl) {
            this.modeEl.textContent = modeTranslations[this.state.mode] || this.state.mode;
        }

        if (this.timerEl) {
            const m = Math.floor(this.state.timeLeft / 60).toString().padStart(2, '0');
            const s = (this.state.timeLeft % 60).toString().padStart(2, '0');
            this.timerEl.textContent = `${m}:${s}`;

            // Adicionar classe visual quando timer está rodando
            if (this.state.isRunning) {
                this.timerEl.classList.add('timer-running');
            } else {
                this.timerEl.classList.remove('timer-running');
            }
        }

        if (this.roundEl) {
            this.roundEl.textContent = `Round: ${this.state.currentRound} / ${this.state.settings.rounds}`;
        }

        // Atualizar título da página
        if (this.state.isRunning) {
            const m = Math.floor(this.state.timeLeft / 60).toString().padStart(2, '0');
            const s = (this.state.timeLeft % 60).toString().padStart(2, '0');
            document.title = `${m}:${s} - PomoTask`;
        } else {
            document.title = 'PomoTask - Pomodoro & Tasks';
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('timerSettings');
            const savedState = localStorage.getItem('timerState');

            if (savedSettings) {
                this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
                this.state.totalRounds = this.state.settings.rounds;
            }

            // Restaurar estado do timer se existir
            if (savedState) {
                const state = JSON.parse(savedState);
                this.state.mode = state.mode || 'focus';
                this.state.timeLeft = state.timeLeft || this.state.settings.focusDuration * 60;
                this.state.currentRound = state.currentRound || 1;
                this.state.isRunning = false; // Sempre inicia pausado ao carregar
            } else {
                this.state.timeLeft = this.state.settings.focusDuration * 60;
            }

            this.updateDisplay();
        } catch (err) {
            console.error('Erro ao carregar configurações:', err);
        }
    }

    saveState() {
        try {
            localStorage.setItem('timerState', JSON.stringify({
                mode: this.state.mode,
                timeLeft: this.state.timeLeft,
                currentRound: this.state.currentRound,
                isRunning: this.state.isRunning
            }));
        } catch (err) {
            console.error('Erro ao salvar estado:', err);
        }
    }

    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.state.totalRounds = this.state.settings.rounds;

        if (!this.state.isRunning) {
            this.state.timeLeft = this.state.settings.focusDuration * 60;
            this.updateDisplay();
        }

        try {
            localStorage.setItem('timerSettings', JSON.stringify(this.state.settings));
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
        }
    }

    async incrementCompletedCycles() {
        try {
            const cyclesStr = localStorage.getItem('completedCycles');
            const cycles = cyclesStr ? JSON.parse(cyclesStr) : [];

            const newCycle = {
                date: new Date().toISOString(),
                rounds: this.state.settings.rounds,
                duration: this.state.settings.focusDuration
            };

            cycles.push(newCycle);
            localStorage.setItem('completedCycles', JSON.stringify(cycles));

            // Tentar sincronizar com API
            try {
                const response = await fetch(`${this.apiUrl}/cycles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCycle)
                });

                if (response.ok) {
                    console.log('Ciclo sincronizado com servidor');
                }
            } catch (err) {
                console.log('Offline - ciclo salvo localmente');
            }
        } catch (err) {
            console.error('Erro ao incrementar ciclos:', err);
        }
    }
}

export default PomodoroTimer;
