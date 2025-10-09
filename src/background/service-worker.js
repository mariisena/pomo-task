// service-worker.js — responsável por eventos em segundo plano
// Compatível com Manifest V3

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "notify") {
    showNotification(request.message);
  }
  if (request.type === "playSound") {
    playSound();
  }
});

function showNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/tomato.png", // usa o mesmo ícone definido no manifest
    title: "PomoTask",
    message: message,
    priority: 2
  });

  // Se quiser sempre tocar junto com a notificação
  playSound();
}

async function playSound() {
  try {
    await chrome.offscreen.createDocument({
      url: "src/popup/sounds.html",
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "Tocar som de notificação ao fim do ciclo"
    });
  } catch (err) {
    console.error("Erro ao criar offscreen:", err);
  }
}
