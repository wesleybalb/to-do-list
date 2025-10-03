// js/views/TaskView.js - Interface do Usuário (VERSÃO MELHORADA)

/**
 * Classe responsável pela renderização e interação com a interface
 * Implementa o padrão Observer para reagir a mudanças no modelo
 * VERSÃO MELHORADA: Recebe dependências via construtor ao invés de referências globais
 */
class TaskView {
    /**
     * Construtor da TaskView
     * @param {TaskModel} model - Referência ao modelo (injeção de dependência)
     */
    constructor(model = null) {
        this.model = model; // Dependência injetada
        this.currentFilter = 'all';
        this.dragDropHandler = null;
        this.eventHandler = null;
        this.elements = this.cacheElements();
        
        // Só inicializa se o modelo estiver disponível
        if (this.model) {
            this.init();
        }
    }

    /**
     * Define o modelo após a criação (para casos onde não foi injetado no construtor)
     * @param {TaskModel} model - Referência ao modelo
     */
    setModel(model) {
        this.model = model;
        if (!this.eventHandler) {
            this.init();
        }
    }

    /**
     * Cache dos elementos DOM para melhor performance
     * @returns {Object} Objeto com referências aos elementos
     */
    cacheElements() {
        return {
            taskInput: document.getElementById('taskInput'),
            todoList: document.getElementById('todo-list'),
            progressList: document.getElementById('progress-list'),
            doneList: document.getElementById('done-list'),
            todoCount: document.getElementById('todoCount'),
            progressCount: document.getElementById('progressCount'),
            doneCount: document.getElementById('doneCount'),
            totalCount: document.getElementById('totalCount'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            stats: document.getElementById('stats')
        };
    }

    /**
     * Inicializa a view configurando event handlers
     */
    init() {
        if (!this.model) {
            console.error('TaskView: Modelo não definido. Use setModel() primeiro.');
            return;
        }

        this.eventHandler = new EventHandler(this);
        this.dragDropHandler = new DragDropHandler(this);
        this.setupEventListeners();
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Filtros
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Enter para adicionar tarefa
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.eventHandler.handleAddTask();
            }
        });

        // Drag and Drop
        this.dragDropHandler.init();
    }

    /**
     * Manipula mudança de filtro
     * @param {Event} e - Evento do clique
     */
    handleFilterChange(e) {
        this.elements.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
    }

    /**
     * Método chamado pelo Observer quando o modelo é atualizado
     */
    update() {
        this.render();
    }

    /**
     * Renderiza toda a interface
     */
    render() {
        if (!this.model) {
            console.warn('TaskView: Tentativa de renderizar sem modelo definido');
            return;
        }
        
        this.renderTasks();
        this.renderStats();
        this.updateEmptyStates();
    }

    /**
     * Renderiza as tarefas nas colunas apropriadas
     */
    renderTasks() {
        if (!this.model) {
            console.warn('TaskView: Tentativa de renderizar tarefas sem modelo definido');
            return;
        }

        const tasks = this.model.getTasks(); // Agora usa this.model em vez de window.taskModel
        const statuses = ['todo', 'progress', 'done'];

        statuses.forEach(status => {
            const list = this.elements[`${status}List`];
            const statusTasks = this.getFilteredTasks(tasks, status);
            
            this.renderTaskList(list, statusTasks, status);
        });
    }

    /**
     * Filtra tarefas baseado no filtro atual e status
     * @param {Task[]} tasks - Array de tarefas
     * @param {string} status - Status da coluna
     * @returns {Task[]} Tarefas filtradas
     */
    getFilteredTasks(tasks, status) {
        return tasks.filter(task => {
            const matchesStatus = task.status === status;
            const matchesFilter = this.currentFilter === 'all' || task.status === this.currentFilter;
            return matchesStatus && matchesFilter;
        });
    }

    /**
     * Renderiza uma lista específica de tarefas
     * @param {HTMLElement} listElement - Elemento da lista
     * @param {Task[]} tasks - Tarefas para renderizar
     * @param {string} status - Status da coluna
     */
    renderTaskList(listElement, tasks, status) {
        if (tasks.length === 0) {
            listElement.innerHTML = `
                <div class="empty-state">
                    ${this.getEmptyStateMessage(status)}
                </div>
            `;
            return;
        }

        listElement.innerHTML = tasks
            .map(task => this.createTaskHTML(task))
            .join('');
        
        // Reconfigurar drag and drop para novos elementos
        this.dragDropHandler.setupTaskElements(listElement);
    }

    /**
     * Cria o HTML para uma tarefa
     * @param {Task} task - Objeto da tarefa
     * @returns {string} HTML da tarefa
     */
   createTaskHTML(task) {
    const timeAgo = task.getTimeAgo();
    const formattedId = task.getFormattedId();
    
    // 🆕 ADICIONAR INDICADOR DE URGÊNCIA
    const urgencyIcon = {
        'baixa': '🟢',
        'normal': '🟡', 
        'urgente': '🔴'
    }[task.urgencyLevel] || '🟡';

    return `
        <div class="task-item" 
             data-task-id="${task.id}" 
             data-status="${task.status}"
             data-urgency="${task.urgencyLevel}"
             draggable="true"
             title="Criada ${timeAgo}">
            <div class="task-content">
                <div class="task-description">${this.escapeHtml(task.description)}</div>
                <div class="task-meta">
                    <span class="task-urgency" title="Urgência: ${task.urgencyLevel}">${urgencyIcon}</span>
                    <span class="task-id">${formattedId}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn details-btn" 
                        onclick="window.taskController.openTaskDetails(${task.id})"
                        title="Ver/Editar detalhes">
                    ℹ️
                </button>
                <button class="action-btn edit-btn" 
                        onclick="window.taskController.editTask(${task.id})"
                        title="Editar tarefa">
                    ✏️
                </button>
                <button class="action-btn delete-btn" 
                        onclick="window.taskController.deleteTask(${task.id})"
                        title="Excluir tarefa">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

    /**
     * Renderiza as estatísticas
     */
    renderStats() {
        if (!this.model) {
            console.warn('TaskView: Tentativa de renderizar stats sem modelo definido');
            return;
        }

        const stats = this.model.getStats(); // Usa this.model
        
        this.elements.todoCount.textContent = stats.todo;
        this.elements.progressCount.textContent = stats.progress;
        this.elements.doneCount.textContent = stats.done;
        this.elements.totalCount.textContent = stats.total;

        this.animateStatsUpdate();
    }

    /**
     * Anima a atualização das estatísticas
     */
    animateStatsUpdate() {
        this.elements.stats.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.elements.stats.style.transform = 'scale(1)';
        }, 150);
    }

    /**
     * Atualiza os estados vazios das colunas
     */
    updateEmptyStates() {
        const lists = [
            { element: this.elements.todoList, status: 'todo' },
            { element: this.elements.progressList, status: 'progress' },
            { element: this.elements.doneList, status: 'done' }
        ];

        lists.forEach(({ element, status }) => {
            const isEmpty = !element.querySelector('.task-item');
            element.classList.toggle('empty', isEmpty);
        });
    }

    /**
     * Retorna mensagem apropriada para estado vazio
     * @param {string} status - Status da coluna
     * @returns {string} Mensagem de estado vazio
     */
    getEmptyStateMessage(status) {
        const messages = {
            'todo': 'Nenhuma tarefa para fazer',
            'progress': 'Nenhuma tarefa em progresso',
            'done': 'Nenhuma tarefa concluída'
        };
        return messages[status] || 'Nenhuma tarefa encontrada';
    }

    /**
     * Limpa o campo de entrada de tarefas
     */
    clearTaskInput() {
        this.elements.taskInput.value = '';
        this.elements.taskInput.focus();
    }

    /**
     * Obtém o valor do campo de entrada
     * @returns {string} Valor do input
     */
    getTaskInputValue() {
        return this.elements.taskInput.value.trim();
    }

    /**
     * Exibe uma mensagem de feedback ao usuário
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo da mensagem ('success', 'error', 'info')
     */
    showMessage(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos inline para a notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#66bb6a' : 
                           type === 'error' ? '#e53e3e' : '#667eea'
        });

        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Remover após delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Escape HTML para prevenir XSS
     * @param {string} text - Texto a ser escapado
     * @returns {string} Texto escapado
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Adiciona classe de loading durante operações assíncronas
     * @param {boolean} isLoading - Estado de loading
     */
    setLoadingState(isLoading) {
        const container = document.querySelector('.container');
        if (isLoading) {
            container.style.opacity = '0.7';
            container.style.pointerEvents = 'none';
        } else {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        }
    }

    /**
     * Força uma nova renderização
     */
    forceUpdate() {
        this.render();
    }

    /**
     * Limpa todos os event listeners
     */
    destroy() {
        if (this.dragDropHandler) {
            this.dragDropHandler.destroy();
        }
        if (this.eventHandler) {
            this.eventHandler.destroy();
        }
    }
}
