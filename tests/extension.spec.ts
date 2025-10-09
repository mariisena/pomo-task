import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '..', 'dist');
const tmpDir = path.resolve(__dirname, '..', '.tmp-profile');

let context: BrowserContext;
let extensionId = '';

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

  // Aguarda um pouco para extensão carregar
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Método 1: Aguardar evento de service worker
  try {
    const [serviceWorker] = await Promise.all([
      context.waitForEvent('serviceworker', { timeout: 10000 }),
    ]);
    const swUrl = serviceWorker.url();
    const match = swUrl.match(/chrome-extension:\/\/([a-z]+)\//);
    if (match) {
      extensionId = match[1];
      console.log('Extension ID capturado via evento:', extensionId);
    }
  } catch (e) {
    console.log('Método 1 (evento) falhou, tentando fallback...');
  }

  // Método 2: Verificar service workers já registrados
  if (!extensionId) {
    const serviceWorkers = context.serviceWorkers();
    console.log('Service workers disponíveis:', serviceWorkers.length);
    if (serviceWorkers.length > 0) {
      const swUrl = serviceWorkers[0].url();
      console.log('Service Worker URL:', swUrl);
      const match = swUrl.match(/chrome-extension:\/\/([a-z]+)\//);
      if (match) {
        extensionId = match[1];
        console.log('Extension ID capturado via service workers existentes:', extensionId);
      }
    }
  }

  // Método 3: Abrir chrome://extensions e extrair ID
  if (!extensionId) {
    console.log('Método 2 falhou, tentando via chrome://extensions...');
    const page = await context.newPage();

    try {
      // Navegar para about:blank primeiro
      await page.goto('about:blank');
      await page.waitForTimeout(2000);

      // Aguardar service workers aparecerem
      for (let i = 0; i < 10; i++) {
        const serviceWorkers = context.serviceWorkers();
        console.log(`Tentativa ${i + 1}: ${serviceWorkers.length} service workers`);

        if (serviceWorkers.length > 0) {
          const swUrl = serviceWorkers[0].url();
          const match = swUrl.match(/chrome-extension:\/\/([a-z]+)\//);
          if (match) {
            extensionId = match[1];
            console.log('Extension ID capturado após retry:', extensionId);
            break;
          }
        }

        await page.waitForTimeout(1000);
      }
    } finally {
      await page.close();
    }
  }

  // Método 4: Navegar diretamente para chrome://extensions (última tentativa)
  if (!extensionId) {
    console.log('Tentando último método: navegar para extensão diretamente...');
    const page = await context.newPage();

    try {
      // Lista todas as páginas abertas pela extensão
      const pages = context.pages();
      for (const p of pages) {
        const url = p.url();
        if (url.startsWith('chrome-extension://')) {
          const match = url.match(/chrome-extension:\/\/([a-z]+)\//);
          if (match) {
            extensionId = match[1];
            console.log('Extension ID capturado via páginas abertas:', extensionId);
            break;
          }
        }
      }
    } finally {
      await page.close();
    }
  }

  if (!extensionId) {
    const pages = context.pages();
    const pageUrls = pages.map(p => p.url()).join(', ');
    throw new Error(`Não foi possível obter o ID da extensão após todos os métodos.
Service workers: ${context.serviceWorkers().length}
Páginas abertas: ${pages.length}
URLs: ${pageUrls}`);
  }

  console.log('✅ Extension ID capturado com sucesso:', extensionId);
});

test.afterAll(async () => {
  await context.close();

  // Limpa o diretório temporário
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test.describe('PomoTask Extension E2E', () => {
  test('service worker está ativo', async () => {
    expect(extensionId).toBeTruthy();
    const serviceWorkers = context.serviceWorkers();
    expect(serviceWorkers.length).toBeGreaterThan(0);
  });

  test('popup HTML existe e carrega elementos principais', async () => {
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
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    const timerText = await popupPage.locator('#timer-display').textContent();
    expect(timerText).toMatch(/\d{1,2}:\d{2}/); // Formato MM:SS

    await popupPage.close();
  });

  test('é possível adicionar uma tarefa', async () => {
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
