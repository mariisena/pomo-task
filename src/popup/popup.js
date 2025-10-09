// popup.js — Lógica principal da interface PomoTask

document.addEventListener('DOMContentLoaded', () => {
    initializePopup();

    // Listener para mensagens do iframe
    window.addEventListener('message', (event) => {
        if (event.data.type === 'navigate' && window.navigationManager) {
            window.navigationManager.showView(event.data.view);
        }
    });
});

function initializePopup() {
    // Botão para abrir janela externa (removido, não existe mais)
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
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target !== menuBtn) {
                menu.classList.remove('show');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar menu ao clicar em um item
        menu.addEventListener('click', () => {
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
