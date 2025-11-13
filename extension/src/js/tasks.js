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
        this.elements.menuBtn = document.getElementById('task-menu-btn');
        this.elements.menu = document.getElementById('task-menu');

        // Elementos do Modal
        this.elements.modal = document.getElementById('confirmation-modal');
        this.elements.modalText = document.getElementById('modal-text');
        this.elements.modalConfirmBtn = document.getElementById('modal-confirm-btn');
        this.elements.modalCancelBtn = document.getElementById('modal-cancel-btn');

        this.bindEvents();
        this.loadTasks().then(() => this.renderTasks());
    }

    bindEvents() {
        // Form de adicionar tarefa
        this.elements.form?.addEventListener('submit', e => {
            e.preventDefault();
            this.addTask();
        });

        // Toggle menu dropdown
        this.elements.menuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.menu?.classList.toggle('show');
            const isOpen = this.elements.menu?.classList.contains('show');
            this.elements.menuBtn?.setAttribute('aria-expanded', isOpen);
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tasks-menu-container') && !e.target.closest('#task-menu')) {
                this.elements.menu?.classList.remove('show');
                this.elements.menuBtn?.setAttribute('aria-expanded', 'false');
            }
        });

        // Botões do menu
        this.elements.clearAll?.addEventListener('click', () => {
            this.showConfirmationModal('Deseja realmente limpar todas as tarefas?', () => {
                this.tasks = [];
                this.saveTasks();
                this.renderTasks();
                this.elements.menu?.classList.remove('show');
            });
        });

        this.elements.clearCompleted?.addEventListener('click', () => {
            this.showConfirmationModal('Deseja limpar as tarefas concluídas?', () => {
                this.tasks = this.tasks.filter(t => !t.completed);
                this.saveTasks();
                this.renderTasks();
                this.elements.menu?.classList.remove('show');
            });
        });

        // Event delegation para a lista de tarefas
        this.elements.tasksList?.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;

            const taskId = parseInt(taskItem.dataset.taskId);

            // Botão de deletar
            if (e.target.closest('.task-delete-btn')) {
                e.preventDefault();
                this.deleteTask(taskId);
            }

            // Botão de editar
            if (e.target.closest('.task-edit-btn')) {
                e.preventDefault();
                this.startEdit(taskId);
            }
        });

        // Event delegation para checkbox
        this.elements.tasksList?.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.taskId);
                this.toggleTask(taskId);
            }
        });

        // Event delegation para duplo clique no texto
        this.elements.tasksList?.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('task-text')) {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.taskId);
                this.startEdit(taskId);
            }
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
        this.showConfirmationModal('Deseja realmente deletar esta tarefa?', () => {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.renderTasks();
        });
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

        input.addEventListener('blur', saveEdit, { once: true });
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
              <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} aria-label="Marcar tarefa como concluída">
              <span class="task-text">${t.text}</span>
              <div class="task-actions">
                <button class="task-edit-btn" title="Editar tarefa" aria-label="Editar tarefa">✏️</button>
                <button class="task-delete-btn" title="Deletar tarefa" aria-label="Deletar tarefa">🗑️</button>
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

    showConfirmationModal(message, onConfirm) {
        if (!this.elements.modal || !this.elements.modalText || !this.elements.modalConfirmBtn || !this.elements.modalCancelBtn) {
            console.error('Modal elements not found');
            return;
        }

        this.elements.modalText.textContent = message;
        this.elements.modal.style.display = 'flex';

        const confirmHandler = () => {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
            hideModal();
        };

        const cancelHandler = () => {
            hideModal();
        };

        const hideModal = () => {
            if (!this.elements.modal) return;
            this.elements.modal.style.display = 'none';
        };

        this.elements.modalConfirmBtn.addEventListener('click', confirmHandler, { once: true });
        this.elements.modalCancelBtn.addEventListener('click', cancelHandler, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
