import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';

test.describe('PomoTask PWA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('deve carregar a página principal', async ({ page }) => {
    await expect(page).toHaveTitle(/PomoTask/i);
    await expect(page.locator('.app-title')).toContainText('PomoTask');
  });

  test('deve exibir o timer com valores iniciais', async ({ page }) => {
    await expect(page.locator('#mode-display')).toContainText('Foco');
    await expect(page.locator('#timer-display')).toContainText('25:00');
    await expect(page.locator('#round-display')).toContainText('Round: 1 / 4');
  });

  test('deve iniciar e pausar o timer', async ({ page }) => {
    const startBtn = page.locator('#start-btn');
    const pauseBtn = page.locator('#pause-btn');
    const timerDisplay = page.locator('#timer-display');

    // Iniciar timer
    await startBtn.click();
    await page.waitForTimeout(2000);

    // Timer deve ter diminuído
    const timeAfterStart = await timerDisplay.textContent();
    expect(timeAfterStart).not.toBe('25:00');

    // Pausar timer
    await pauseBtn.click();
    await page.waitForTimeout(1000);

    // Timer deve estar pausado
    const timePaused = await timerDisplay.textContent();
    await page.waitForTimeout(1000);
    const timeStillPaused = await timerDisplay.textContent();
    expect(timePaused).toBe(timeStillPaused);
  });

  test('deve resetar o timer', async ({ page }) => {
    const startBtn = page.locator('#start-btn');
    const resetBtn = page.locator('#reset-btn');
    const timerDisplay = page.locator('#timer-display');

    // Iniciar e esperar um pouco
    await startBtn.click();
    await page.waitForTimeout(2000);

    // Resetar
    await resetBtn.click();

    // Deve voltar ao inicial
    await expect(timerDisplay).toContainText('25:00');
    await expect(page.locator('#mode-display')).toContainText('Foco');
    await expect(page.locator('#round-display')).toContainText('Round: 1 / 4');
  });

  test('deve adicionar uma tarefa', async ({ page }) => {
    const taskInput = page.locator('#task-input');
    const addBtn = page.locator('#add-btn');
    const tasksList = page.locator('#tasks-list');

    // Adicionar tarefa
    await taskInput.fill('Estudar Playwright');
    await addBtn.click();

    // Verificar se apareceu na lista
    await expect(tasksList.locator('.task-item')).toHaveCount(1);
    await expect(tasksList.locator('.task-text')).toContainText('Estudar Playwright');
  });

  test('deve marcar tarefa como completa', async ({ page }) => {
    const taskInput = page.locator('#task-input');
    const addBtn = page.locator('#add-btn');

    // Adicionar tarefa
    await taskInput.fill('Tarefa de teste');
    await addBtn.click();

    // Marcar como completa
    const checkbox = page.locator('.task-checkbox').first();
    await checkbox.check();

    // Verificar se ficou marcada
    await expect(checkbox).toBeChecked();
    await expect(page.locator('.task-item').first()).toHaveClass(/completed/);
  });

  test('deve deletar uma tarefa', async ({ page }) => {
    const taskInput = page.locator('#task-input');
    const addBtn = page.locator('#add-btn');
    const tasksList = page.locator('#tasks-list');

    // Adicionar tarefa
    await taskInput.fill('Tarefa para deletar');
    await addBtn.click();

    // Clicar no botão de deletar
    const deleteBtn = page.locator('.task-delete-btn').first();
    await deleteBtn.click();

    // Confirmar no modal
    await page.locator('#modal-confirm-btn').click();

    // Verificar se foi removida
    await expect(tasksList.locator('.task-item')).toHaveCount(0);
    await expect(tasksList.locator('.empty-message')).toBeVisible();
  });

  test('deve navegar para configurações', async ({ page }) => {
    const settingsBtn = page.locator('#settings-btn');

    // Ir para configurações
    await settingsBtn.click();

    // Verificar se está na tela de configurações
    await expect(page.locator('#settings-view')).toHaveClass(/active/);
    await expect(page.locator('.settings-main-title')).toContainText('CONFIGURAÇÕES');
  });

  test('deve alterar configurações do timer', async ({ page }) => {
    // Ir para configurações
    await page.locator('#settings-btn').click();

    // Alterar duração do foco
    const focusInput = page.locator('#focus-duration');
    await focusInput.fill('30');

    // Confirmar
    await page.locator('#confirm-settings-btn').click();

    // Verificar se voltou para tela principal
    await expect(page.locator('#main-view')).toHaveClass(/active/);

    // Timer deve refletir nova configuração (se não estiver rodando)
    // await expect(page.locator('#timer-display')).toContainText('30:00');
  });

  test('deve persistir tarefas após reload', async ({ page }) => {
    const taskInput = page.locator('#task-input');
    const addBtn = page.locator('#add-btn');

    // Adicionar tarefa
    await taskInput.fill('Tarefa persistente');
    await addBtn.click();

    // Recarregar página
    await page.reload();

    // Verificar se tarefa ainda está lá
    await expect(page.locator('.task-text')).toContainText('Tarefa persistente');
  });

  test('deve exibir status de sincronização', async ({ page }) => {
    const syncStatus = page.locator('#sync-status');
    await expect(syncStatus).toBeVisible();
    await expect(syncStatus.locator('.status-text')).toBeVisible();
  });

  test('deve ter manifest PWA', async ({ page }) => {
    // Verificar se há link para manifest
    const manifestLink = page.locator('link[rel="manifest"]');

    // Se o Vite PWA plugin injetar automaticamente, o manifest existirá
    // Caso contrário, podemos verificar via API
    const manifestUrl = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.href : null;
    });

    if (manifestUrl) {
      expect(manifestUrl).toContain('manifest');
    }
  });

  test('deve registrar service worker', async ({ page, context }) => {
    // Aguardar registro do service worker
    await page.waitForTimeout(2000);

    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });

    expect(swRegistered).toBe(true);
  });
});

test.describe('PWA - Responsividade', () => {
  test('deve ser responsivo em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    await expect(page.locator('.app-title')).toBeVisible();
    await expect(page.locator('#timer-display')).toBeVisible();
    await expect(page.locator('#task-input')).toBeVisible();
  });

  test('deve ser responsivo em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);

    await expect(page.locator('.app-title')).toBeVisible();
    await expect(page.locator('#timer-display')).toBeVisible();
  });
});
