/**
 * Tasks.js - Gerencia o sistema de tarefas da extensão
 * Compatível com Manifest V3
 */

class TaskManager {
    constructor() {
        this.tasks = [];
        this.nextId = 1;
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadTasks();
        this.renderTasks();
    }

    cacheElements() {
        const ids = [
            'add-task-form', 'task-input', 'add-btn', 'tasks-list',
            'task-menu-btn', 'task-menu', 'clear-completed-btn', 'clear-all-btn'
        ];

        ids.forEach(id => {
            const camelCaseKey = id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            this.elements[camelCaseKey] = document.getElementById(id);
        });
    }

    bindEvents() {
        const {
            form, input, addBtn,
            clearCompletedBtn, clearAllBtn
        } = this.elements;

        form?.addEventListener('submit', e => {
            e.preventDefault();
            this.addTask();
        });

        addBtn?.addEventListener('click', e => {
            e.preventDefault();
            this.addTask();
        });

        input?.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTask();
            }
        });

        clearCompletedBtn?.addEventListener('click', () => {
            this.clearCompletedTasks();
            this.closeMenu();
        });

        clearAllBtn?.addEventListener('click', () => {
            this.clearAllTasks();
            this.closeMenu();
        });

        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (input && input.value.trim()) {
                    e.preventDefault();
                    this.addTask();
                }
            }
        });
    }

    addTask() {
        const { input } = this.elements;
        const text = input?.value.trim();
        if (!text) return;

        const task = {
            id: this.nextId++,
            text,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(task);
        input.value = '';
        this.saveTasks();
        this.renderTasks();
        this.announce(`Tarefa adicionada: ${text}`);
        input?.focus();
    }

    toggleTask(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) return;

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;

        this.saveTasks();
        this.renderTasks();
        this.announce(`Tarefa ${task.completed ? 'concluída' : 'reaberta'}: ${task.text}`);
    }

    deleteTask(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index === -1) return;

        const [task] = this.tasks.splice(index, 1);
        this.saveTasks();
        this.renderTasks();
        this.announce(`Tarefa removida: ${task.text}`);
    }

    editTask(taskId, newText) {
        const task = this.getTaskById(taskId);
        if (!task || !newText.trim()) return;

        const oldText = task.text;
        task.text = newText.trim();

        this.saveTasks();
        this.renderTasks();
        this.announce(`Tarefa editada de "${oldText}" para "${task.text}"`);
    }

    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (!completedCount) {
            this.announce('Nenhuma tarefa concluída para remover');
            return;
        }

        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.renderTasks();
        this.announce(`${completedCount} tarefa(s) concluída(s) removida(s)`);
    }

    clearAllTasks() {
        if (!this.tasks.length) {
            this.announce('Nenhuma tarefa para remover');
            return;
        }

        const taskCount = this.tasks.length;
        this.tasks = [];
        this.saveTasks();
        this.renderTasks();
        this.announce(`Todas as ${taskCount} tarefa(s) foram removidas`);
    }

    renderTasks() {
        const { tasksList } = this.elements;
        if (!tasksList) return;

        if (!this.tasks.length) {
            tasksList.innerHTML = `
                <li class="empty-state">
                    <p>Nenhuma tarefa adicionada ainda.</p>
                    <p>Use o campo acima para adicionar sua primeira tarefa!</p>
                </li>
            `;
            return;
        }

        const sortedTasks = [...this.tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        tasksList.innerHTML = sortedTasks.map(t => this.renderTaskItem(t)).join('');
        this.bindTaskEvents();
    }

    renderTaskItem(task) {
        const completedClass = task.completed ? 'completed' : '';
        const checked = task.completed ? 'checked' : '';
        const ariaChecked = task.completed ? 'true' : 'false';

        return `
            <li class="task-item ${completedClass}" data-task-id="${task.id}">
                <label class="task-checkbox-label">
                    <input type="checkbox" class="task-checkbox" ${checked} aria-checked="${ariaChecked}" aria-describedby="task-text-${task.id}" />
                    <span class="checkbox-custom"></span>
                </label>
                <span id="task-text-${task.id}" class="task-text" contenteditable="false" role="textbox" aria-label="Texto da tarefa" tabindex="0">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" aria-label="Editar tarefa" title="Editar tarefa">
                        <img src="icons/edit.svg" alt="" width="16" height="16" aria-hidden="true">
                    </button>
                    <button class="task-action-btn delete-btn" aria-label="Excluir tarefa" title="Excluir tarefa">
                        <img src="icons/trash.svg" alt="" width="16" height="16" aria-hidden="true">
                    </button>
                </div>
            </li>
        `;
    }

    bindTaskEvents() {
        const { tasksList } = this.elements;
        if (!tasksList) return;

        tasksList.addEventListener('change', e => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.closest('.task-item')?.dataset.taskId);
                this.toggleTask(taskId);
            }
        });

        tasksList.addEventListener('click', e => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = parseInt(taskItem.dataset.taskId);

            if (e.target.closest('.edit-btn')) {
                this.startEditingTask(taskId);
            } else if (e.target.closest('.delete-btn')) {
                this.deleteTask(taskId);
            }
        });

        tasksList.addEventListener('keydown', e => {
            if (e.target.classList.contains('task-text')) {
                const taskId = parseInt(e.target.closest('.task-item')?.dataset.taskId);

                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.finishEditingTask(taskId, e.target.textContent);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.cancelEditingTask(taskId);
                }
            }
        });

        tasksList.addEventListener('blur', e => {
            if (e.target.classList.contains('task-text') && e.target.contentEditable === 'true') {
                const taskId = parseInt(e.target.closest('.task-item')?.dataset.taskId);
                this.finishEditingTask(taskId, e.target.textContent);
            }
        }, true);
    }

    startEditingTask(taskId) {
        const taskText = document.querySelector(`[data-task-id="${taskId}"] .task-text`);
        if (!taskText) return;

        taskText.contentEditable = 'true';
        taskText.focus();

        const range = document.createRange();
        range.selectNodeContents(taskText);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        taskText.classList.add('editing');
        this.announce('Modo de edição ativado. Pressione Enter para salvar ou Escape para cancelar.');
    }

    finishEditingTask(taskId, newText) {
        const taskText = document.querySelector(`[data-task-id="${taskId}"] .task-text`);
        if (!taskText) return;

        taskText.contentEditable = 'false';
        taskText.classList.remove('editing');

        const task = this.getTaskById(taskId);
        if (newText.trim() && newText.trim() !== task?.text) {
            this.editTask(taskId, newText.trim());
        } else {
            this.renderTasks();
        }
    }

    cancelEditingTask(taskId) {
        const taskText = document.querySelector(`[data-task-id="${taskId}"] .task-text`);
        const task = this.getTaskById(taskId);
        if (!taskText || !task) return;

        taskText.contentEditable = 'false';
        taskText.classList.remove('editing');
        taskText.textContent = task.text;

        this.announce('Edição cancelada');
    }

    closeMenu() {
        window.navigationManager?.toggleTaskMenu(false);
    }

    autoCheckFirstIncompleteTask() {
        const first = this.tasks.find(t => !t.completed);
        if (first) this.toggleTask(first.id);
    }

    getTaskById(id) {
        return this.tasks.find(t => t.id === id);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    announce(message) {
        const div = document.createElement('div');
        div.setAttribute('aria-live', 'polite');
        div.setAttribute('aria-atomic', 'true');
        div.className = 'sr-only';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 1000);
    }

    async saveTasks() {
        try {
            await chrome.storage.local.set({ tasks: this.tasks, nextTaskId: this.nextId });
        } catch {
            localStorage.setItem('pomoTasks_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('pomoTasks_nextTaskId', this.nextId);
        }
    }

    async loadTasks() {
        try {
            const result = await chrome.storage.local.get(['tasks', 'nextTaskId']);
            if (result.tasks) this.tasks = result.tasks;
            if (result.nextTaskId) this.nextId = result.nextTaskId;
        } catch {
            const saved = localStorage.getItem('pomoTasks_tasks');
            const id = localStorage.getItem('pomoTasks_nextTaskId');
            if (saved) this.tasks = JSON.parse(saved);
            if (id) this.nextId = parseInt(id);
        }
    }

    getTasks() {
        return [...this.tasks];
    }

    getCompletedTasksCount() {
        return this.tasks.filter(t => t.completed).length;
    }

    getIncompleteTasksCount() {
        return this.tasks.filter(t => !t.completed).length;
    }

    exportTasks() {
        return {
            tasks: this.tasks,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    importTasks(data) {
        if (!Array.isArray(data.tasks)) throw new Error('Formato de dados inválido');

        this.tasks = data.tasks;
        this.nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;

        this.saveTasks();
        this.renderTasks();
        this.announce(`${this.tasks.length} tarefa(s) importada(s)`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}
