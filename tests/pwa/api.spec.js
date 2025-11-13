import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('PomoTask API', () => {
  test('deve retornar health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.message).toContain('PomoTask API');
  });

  test('deve listar tarefas vazias inicialmente', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/tasks`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.tasks)).toBe(true);
  });

  test('deve criar uma nova tarefa', async ({ request }) => {
    const newTask = {
      text: 'Tarefa de teste via API',
      completed: false
    };

    const response = await request.post(`${API_URL}/api/tasks`, {
      data: newTask
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.task.text).toBe(newTask.text);
    expect(data.task.id).toBeDefined();
  });

  test('não deve criar tarefa sem texto', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/tasks`, {
      data: { text: '' }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.error).toContain('required');
  });

  test('deve atualizar uma tarefa', async ({ request }) => {
    // Criar tarefa
    const createRes = await request.post(`${API_URL}/api/tasks`, {
      data: { text: 'Tarefa original' }
    });
    const created = await createRes.json();
    const taskId = created.task.id;

    // Atualizar
    const updateRes = await request.put(`${API_URL}/api/tasks/${taskId}`, {
      data: { text: 'Tarefa atualizada', completed: true }
    });

    expect(updateRes.ok()).toBeTruthy();

    const updated = await updateRes.json();
    expect(updated.task.text).toBe('Tarefa atualizada');
    expect(updated.task.completed).toBe(true);
  });

  test('deve deletar uma tarefa', async ({ request }) => {
    // Criar tarefa
    const createRes = await request.post(`${API_URL}/api/tasks`, {
      data: { text: 'Tarefa para deletar' }
    });
    const created = await createRes.json();
    const taskId = created.task.id;

    // Deletar
    const deleteRes = await request.delete(`${API_URL}/api/tasks/${taskId}`);

    expect(deleteRes.ok()).toBeTruthy();

    const deleted = await deleteRes.json();
    expect(deleted.ok).toBe(true);
  });

  test('deve sincronizar tarefas em bulk', async ({ request }) => {
    const tasks = [
      { id: 1, text: 'Tarefa 1', completed: false },
      { id: 2, text: 'Tarefa 2', completed: true },
      { id: 3, text: 'Tarefa 3', completed: false }
    ];

    const response = await request.post(`${API_URL}/api/tasks/sync`, {
      data: { tasks }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.synced).toBe(3);
    expect(data.tasks.length).toBe(3);
  });

  test('deve registrar ciclo pomodoro', async ({ request }) => {
    const cycle = {
      date: new Date().toISOString(),
      rounds: 4,
      duration: 25,
      tasksCompleted: 2
    };

    const response = await request.post(`${API_URL}/api/cycles`, {
      data: cycle
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.cycle.rounds).toBe(4);
  });

  test('deve listar ciclos completados', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/cycles`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.cycles)).toBe(true);
    expect(data.total).toBeGreaterThanOrEqual(0);
  });

  test('deve retornar estatísticas', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/stats`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.stats).toBeDefined();
    expect(data.stats.totalCycles).toBeGreaterThanOrEqual(0);
    expect(data.stats.totalRounds).toBeGreaterThanOrEqual(0);
    expect(data.stats.totalTasks).toBeGreaterThanOrEqual(0);
  });

  test('deve retornar 404 para endpoint inexistente', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/nao-existe`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.ok).toBe(false);
  });
});
