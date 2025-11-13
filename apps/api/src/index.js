import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Armazenamento em memória (simulando banco de dados)
let tasks = [];
let completedCycles = [];
let nextTaskId = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'PomoTask API is running!', timestamp: new Date().toISOString() });
});

// ============ ENDPOINTS DE TAREFAS ============

// Listar todas as tarefas
app.get('/api/tasks', (req, res) => {
  res.json({ ok: true, tasks });
});

// Criar nova tarefa
app.post('/api/tasks', (req, res) => {
  const { text, completed = false } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ ok: false, error: 'Text is required' });
  }

  const newTask = {
    id: nextTaskId++,
    text: text.trim(),
    completed,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json({ ok: true, task: newTask });
});

// Atualizar tarefa
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { text, completed } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ ok: false, error: 'Task not found' });
  }

  if (text !== undefined) tasks[taskIndex].text = text.trim();
  if (completed !== undefined) tasks[taskIndex].completed = completed;
  tasks[taskIndex].updatedAt = new Date().toISOString();

  res.json({ ok: true, task: tasks[taskIndex] });
});

// Deletar tarefa
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ ok: false, error: 'Task not found' });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ ok: true, task: deletedTask });
});

// Sincronizar tarefas (bulk update)
app.post('/api/tasks/sync', (req, res) => {
  const { tasks: clientTasks } = req.body;

  if (!Array.isArray(clientTasks)) {
    return res.status(400).json({ ok: false, error: 'tasks must be an array' });
  }

  // Substituir todas as tarefas
  tasks = clientTasks.map((task, index) => ({
    ...task,
    id: task.id || (nextTaskId + index),
    syncedAt: new Date().toISOString()
  }));

  // Atualizar nextTaskId
  if (tasks.length > 0) {
    nextTaskId = Math.max(...tasks.map(t => t.id)) + 1;
  }

  res.json({ ok: true, tasks, synced: tasks.length });
});

// ============ ENDPOINTS DE CICLOS POMODORO ============

// Listar ciclos completados
app.get('/api/cycles', (req, res) => {
  res.json({ ok: true, cycles: completedCycles, total: completedCycles.length });
});

// Registrar ciclo completado
app.post('/api/cycles', (req, res) => {
  const { date, rounds, duration, tasksCompleted = 0 } = req.body;

  if (!date) {
    return res.status(400).json({ ok: false, error: 'date is required' });
  }

  const newCycle = {
    id: completedCycles.length + 1,
    date,
    rounds: rounds || 1,
    duration: duration || 25,
    tasksCompleted,
    timestamp: new Date().toISOString()
  };

  completedCycles.push(newCycle);
  res.status(201).json({ ok: true, cycle: newCycle });
});

// Estatísticas de produtividade
app.get('/api/stats', (req, res) => {
  const totalCycles = completedCycles.length;
  const totalRounds = completedCycles.reduce((sum, c) => sum + (c.rounds || 0), 0);
  const totalTasks = tasks.filter(t => t.completed).length;
  const totalMinutes = completedCycles.reduce((sum, c) => sum + (c.duration || 0), 0);

  res.json({
    ok: true,
    stats: {
      totalCycles,
      totalRounds,
      totalTasks,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      activeTasks: tasks.filter(t => !t.completed).length,
      completedTasks: totalTasks
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍅 PomoTask API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
