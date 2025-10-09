import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '..', 'dist');
const tmpDir = path.resolve(__dirname, '..', '.tmp-profile');

let context: BrowserContext;

test.beforeAll(async () => {
  // Cria diretório temporário para o perfil
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Lança o Chromium com a extensão carregada
  context = await chromium.launchPersistentContext(tmpDir, {
    headless: process.env.CI === 'true', // Headless no CI/Docker, headed localmente
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  // Aguarda um pouco para a extensão carregar
  await new Promise(resolve => setTimeout(resolve, 2000));
});

test.afterAll(async () => {
  await context.close();

  // Limpa o diretório temporário
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// Helper para obter o ID da extensão
async function getExtensionId(context: BrowserContext): Promise<string> {
  // Tenta pegar o ID do service worker
  let serviceWorkers = context.serviceWorkers();

  // Se não houver service workers, aguarda um pouco e tenta novamente
  if (serviceWorkers.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    serviceWorkers = context.serviceWorkers();
  }

  if (serviceWorkers.length > 0) {
    const url = serviceWorkers[0].url();
    const match = url.match(/chrome-extension:\/\/([a-z]+)\//);
    if (match) return match[1];
  }

  // Fallback: abre chrome://extensions e pega o ID via JavaScript
  const page = await context.newPage();
  await page.goto('chrome://extensions');

  // Injeta script para pegar o ID da extensão
  const extensionId = await page.evaluate(() => {
    const extensionElements = document.querySelectorAll('extensions-item');
    for (const el of extensionElements) {
      const shadowRoot = el.shadowRoot;
      if (shadowRoot) {
        const nameEl = shadowRoot.querySelector('#name');
        if (nameEl && nameEl.textContent?.includes('PomoTask')) {
          return el.getAttribute('id') || '';
        }
      }
    }
    return '';
  });

  await page.close();
  return extensionId || '';
}

test.describe('PomoTask Extension E2E', () => {
  test('service worker está ativo', async () => {
    const serviceWorkers = context.serviceWorkers();
    expect(serviceWorkers.length).toBeGreaterThan(0);
  });

  test('popup HTML existe e carrega elementos principais', async () => {
    const extensionId = await getExtensionId(context);
    expect(extensionId).toBeTruthy();

    // Abre o popup da extensão
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    // Valida elementos principais do popup
    await expect(popupPage.locator('#timer-display')).toBeVisible({ timeout: 5000 });
    await expect(popupPage.locator('#main-start-btn')).toBeVisible();
    await expect(popupPage.locator('#task-input')).toBeVisible();

    await popupPage.close();
  });

  test('timer exibe tempo inicial correto', async () => {
    const extensionId = await getExtensionId(context);
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    const timerText = await popupPage.locator('#timer-display').textContent();
    expect(timerText).toMatch(/\d{1,2}:\d{2}/); // Formato MM:SS

    await popupPage.close();
  });

  test('é possível adicionar uma tarefa', async () => {
    const extensionId = await getExtensionId(context);
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    // Adiciona uma tarefa
    await popupPage.locator('#task-input').fill('Teste E2E');
    await popupPage.locator('#add-btn').click();

    // Verifica se a tarefa foi adicionada
    await expect(popupPage.locator('.task-item')).toBeVisible();
    await expect(popupPage.locator('.task-text')).toHaveText('Teste E2E');

    await popupPage.close();
  });

  test('botões do timer estão funcionais', async () => {
    const extensionId = await getExtensionId(context);
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    // Verifica que os botões estão presentes e habilitados
    const startBtn = popupPage.locator('#main-start-btn');
    const pauseBtn = popupPage.locator('#main-pause-btn');
    const resetBtn = popupPage.locator('#main-reset-btn');

    await expect(startBtn).toBeEnabled();
    await expect(pauseBtn).toBeEnabled();
    await expect(resetBtn).toBeEnabled();

    await popupPage.close();
  });

  test('navegação para tela de configurações funciona', async () => {
    const extensionId = await getExtensionId(context);
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    // Espera o iframe do header carregar
    const headerFrame = popupPage.frameLocator('.header-frame');

    // Clica no botão de configurações (aguarda o iframe carregar)
    await headerFrame.locator('#open-settings').click({ timeout: 5000 });

    // Verifica se a tela de configurações está visível
    await expect(popupPage.locator('#settings-view')).toBeVisible();
    await expect(popupPage.locator('#focus-duration')).toBeVisible();

    await popupPage.close();
  });
});
