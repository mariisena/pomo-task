// popup.js — Lógica principal da interface PomoTask

// === ELEMENTOS DA INTERFACE ===

const openTimerWindowBtn = document.getElementById("open-timer-window-btn");
const timerDisplay = document.getElementById("timer-display");
const modeDisplay = document.getElementById("mode-display");
const roundDisplay = document.getElementById("round-display");

// === INICIALIZAÇÃO ===

document.addEventListener('DOMContentLoaded', () => {
    initializePopup();
});

function initializePopup() {
    // Carregar configurações e atualizar display
    loadSettings();
    
    // Bind events
    if (openTimerWindowBtn) {
        openTimerWindowBtn.addEventListener('click', openTimerWindow);
    }
}

// === FUNÇÕES ===

function openTimerWindow() {
    chrome.windows.create({
        url: chrome.runtime.getURL('src/popup/timer-window.html'),
        type: 'popup',
        width: 320,
        height: 450,
        focused: true
    }, (window) => {
        console.log('Timer window opened:', window.id);
    });
}

function loadSettings() {
    chrome.storage.sync.get(['pomoSettings'], (result) => {
        if (result.pomoSettings) {
            updateDisplayFromSettings(result.pomoSettings);
        } else {
            // Configurações padrão
            updateDisplayFromSettings({
                focusDuration: 25,
                shortBreakDuration: 5,
                longBreakDuration: 15,
                rounds: 4
            });
        }
    });
}

function updateDisplayFromSettings(settings) {
    // Atualizar display com configurações atuais
    const minutes = Math.floor(settings.focusDuration);
    const seconds = 0;
    
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (modeDisplay) {
        modeDisplay.textContent = 'Focus';
    }
    
    if (roundDisplay) {
        roundDisplay.textContent = `Round: 1 / ${settings.rounds}`;
    }
}

