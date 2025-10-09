// popup.js — Lógica principal da interface PomoTask

document.addEventListener('DOMContentLoaded', () => {
    initializePopup();
});

function initializePopup() {
    // Botão para abrir janela externa
    const openTimerWindowBtn = document.getElementById("open-timer-window-btn");
    if (openTimerWindowBtn) {
        openTimerWindowBtn.addEventListener('click', openTimerWindow);
    }

    // Menu dropdown de tarefas
    const menuBtn = document.getElementById('task-menu-btn');
    const menu = document.getElementById('task-menu');

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
            menuBtn.setAttribute('aria-expanded', menu.classList.contains('show'));
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', () => {
            menu.classList.remove('show');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    }
}

function openTimerWindow() {
    chrome.windows.create({
        url: chrome.runtime.getURL('src/popup/timer-window.html'),
        type: 'popup',
        width: 320,
        height: 500,
        focused: true
    }, (window) => {
        console.log('Timer window opened:', window.id);
    });
}
