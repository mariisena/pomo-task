document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('open-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Envia uma mensagem para a janela pai (popup.html) para navegar
            window.parent.postMessage({ type: 'navigate', view: 'settings-view' }, window.location.origin);
        });
    }
});
