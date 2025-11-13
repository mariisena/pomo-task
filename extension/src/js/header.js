document.addEventListener('DOMContentLoaded', () => {
    console.log('Header.js loaded');
    const settingsBtn = document.getElementById('open-settings');
    console.log('Settings button:', settingsBtn);

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Settings button clicked!');
            // Envia uma mensagem para a janela pai (popup.html) para navegar
            // Usando '*' em vez de window.location.origin para evitar problemas de CORS
            window.parent.postMessage({ type: 'navigate', view: 'settings' }, '*');
            console.log('Message sent to parent');
        });
    }
});
