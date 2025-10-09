// Tasks.js - Gerencia tarefas
class TaskManager {
    constructor() {
        this.tasks = [];
        this.nextId = 1;
        this.elements = {};
        this.init();
    }

    init() {
        this.elements.form = document.getElementById('add-task-form');
        this.elements.input = document.getElementById('task-input');
        this.elements.tasksList = document.getElementById('tasks-list');
        this.elements.clearAll = document.getElementById('clear-all-btn');
        this.elements.clearCompleted = document.getElementById('clear-completed-btn');

        this.bindEvents();
        this.loadTasks();
        this.renderTasks();
    }

    bindEvents() {
        this.elements.form?.addEventListener('submit', e => {
            e.preventDefault();
            this.addTask();
        });

        this.elements.clearAll?.addEventListener('click', () => {
            if (confirm('Deseja realmente limpar todas as tarefas?')) {
                this.tasks = [];
                this.saveTasks();
                this.renderTasks();
            }
        });

        this.elements.clearCompleted?.addEventListener('click', () => {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.renderTasks();
        });
    }

    addTask() {
        const text = this.elements.input?.value.trim();
        if (!text) return;

        this.tasks.push({ id: this.nextId++, text, completed: false });
        this.elements.input.value = '';
        this.saveTasks();
        this.renderTasks();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) task.completed = !task.completed;
        this.saveTasks();
        this.renderTasks();
    }

    deleteTask(id) {
        if (confirm('Deseja realmente deletar esta tarefa?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText && newText.trim()) {
            task.text = newText.trim();
            this.saveTasks();
            this.renderTasks();
        }
    }

    startEdit(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const taskEl = document.querySelector(`li[data-task-id="${id}"]`);
        if (!taskEl) return;

        const textSpan = taskEl.querySelector('.task-text');
        const currentText = task.text;

        // Criar input de edição
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input';
        input.value = currentText;

        // Substituir span por input
        textSpan.replaceWith(input);
        input.focus();
        input.select();

        // Salvar ao pressionar Enter ou perder foco
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                this.editTask(id, newText);
            } else {
                this.renderTasks();
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.renderTasks();
            }
        });
    }

    renderTasks() {
        if (!this.elements.tasksList) return;
        if (!this.tasks.length) {
            this.elements.tasksList.innerHTML = "<li class='empty-message'>Nenhuma tarefa.</li>";
            return;
        }
        this.elements.tasksList.innerHTML = this.tasks.map(t => `
            <li class="task-item ${t.completed ? 'completed' : ''}" data-task-id="${t.id}">
              <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''}
                     onchange="taskManager.toggleTask(${t.id})" aria-label="Marcar tarefa como concluída">
              <span class="task-text" ondblclick="taskManager.startEdit(${t.id})">${t.text}</span>
              <div class="task-actions">
                <button class="task-edit-btn" onclick="taskManager.startEdit(${t.id})" title="Editar tarefa" aria-label="Editar tarefa">✏️</button>
                <button class="task-delete-btn" onclick="taskManager.deleteTask(${t.id})" title="Deletar tarefa" aria-label="Deletar tarefa">🗑️</button>
              </div>
            </li>
        `).join('');
    }

    async saveTasks() {
        await chrome.storage.local.set({ tasks: this.tasks, nextId: this.nextId });
    }

    async loadTasks() {
        const result = await chrome.storage.local.get(['tasks', 'nextId']);
        if (result.tasks) this.tasks = result.tasks;
        if (result.nextId) this.nextId = result.nextId;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
