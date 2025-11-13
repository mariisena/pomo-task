// main.js - Entry point do PWA
import PomodoroTimer from './js/pomodoro-timer.js';
import TaskManager from './js/tasks.js';
import SettingsManager from './js/settings.js';
import NavigationManager from './js/navigation.js';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // O Vite PWA plugin já registra o SW automaticamente
      // Este código é apenas fallback
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrado:', registration.scope);
    } catch (err) {
      console.log('Erro ao registrar Service Worker:', err);
    }
  });
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar managers na ordem correta
  window.pomodoroTimer = new PomodoroTimer();
  window.taskManager = new TaskManager();
  window.settingsManager = new SettingsManager(window.pomodoroTimer);
  window.navigationManager = new NavigationManager();

  console.log('✅ PomoTask PWA inicializado');
});

// Detectar instalação do PWA
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('PWA pode ser instalado');
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalado com sucesso!');
  window.deferredPrompt = null;
});

// Online/Offline detection
window.addEventListener('online', () => {
  console.log('🌐 Online');
  if (window.taskManager) {
    window.taskManager.updateSyncStatus('online');
    window.taskManager.syncWithServer(true);
  }
});

window.addEventListener('offline', () => {
  console.log('📴 Offline');
  if (window.taskManager) {
    window.taskManager.updateSyncStatus('offline');
  }
});
