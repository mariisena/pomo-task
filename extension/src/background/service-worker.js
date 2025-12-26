// service-worker.js — responsável por eventos em segundo plano

// Listener para mensagens de outras partes da extensão
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'notify') {
    showNotification(request.message);
  } else if (request.type === 'playSound') {
    playSound();
  }
  // Retornar true para indicar que a resposta será assíncrona
  return true;
});

// Função para exibir notificações
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/tomato.png',
    title: 'PomoTask',
    message: message,
    priority: 2
  });
}

// Função para tocar som usando a API Offscreen
async function playSound() {
  // Fecha qualquer documento offscreen existente antes de criar um novo
  // Isso garante que o som toque toda vez
  try {
    if (await chrome.offscreen.hasDocument()) {
      await chrome.offscreen.closeDocument();
    }
  } catch (error) {
    console.log('Nenhum documento offscreen para fechar:', error);
  }

  // Cria novo documento offscreen (que automaticamente toca o som ao carregar)
  await chrome.offscreen.createDocument({
    url: 'src/popup/sounds.html',
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Tocar som de notificação ao fim do ciclo'
  });
}

// Listener para alarmes (se você usar a API de alarmes)
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarme disparado:', alarm.name);
  // Adicione aqui a lógica para o que acontece quando um alarme dispara
});

