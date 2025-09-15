// service-worker.js — responsável por eventos em segundo plano

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "notify") {
    showNotification(request.message);
  }
});

function showNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "PomoTask",
    message: message,
    priority: 2
  });

  // Tocar som se for permitido
  playSound();
}

function playSound() {
  // Usando offscreen para tocar áudio (Manifest V3 exige isso)
  chrome.offscreen.createDocument({
    url: "/src/popup/sounds.html",
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: "Tocar som de notificação ao fim do ciclo"
  }).catch(err => console.error("Erro ao criar offscreen:", err));
}
