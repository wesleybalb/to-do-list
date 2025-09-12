// js/utils/EventHandler.js - Manipulador de Eventos

/**
 * Classe responsável pelo gerenciamento de eventos da aplicação
 * Centraliza a lógica de manipulação de eventos de interface
 */
class EventHandler {
    /**
     * Construtor do EventHandler
     * @param {TaskView} view - Instância da view
     */
    constructor(view) {
        this.view = view;
        this.activeListeners = new Map();
        this.debounceTimers = new Map();
        
        // Configurações
        this.config = {
            debounceDelay: 300, // ms
            longPressDelay: 500, // ms
            doubleClickDelay: 300 // ms
        };

        this.init();
    }

    /**
     * Inicializa o manipulador de eventos
     */
    init() {
        this.setupKeyboardShortcuts();
        this.setupAccessibilityEvents();
        this.setupPerformanceOptimizations();
        
        console.log('EventHandler inicializado');
    }

    /**
     * Configura atalhos de teclado
     */
    setupKeyboardShortcuts() {
        const shortcuts = {
            'Enter': this.handleAddTask.bind(this),
            'Escape': this.handleEscape.bind(this),
            'Ctrl+a': this.handleSelectAll.bind(this),
            'Ctrl+z': this.handleUndo.bind(this),
            'Delete': this.handleDeleteSelected.bind(this),
            'F2': this.handleRename.bind(this)
        };

        this.addGlobalEventListener('keydown', (e) => {
            const key = this.getKeyboardShortcut(e);
            
            if (shortcuts[key]) {
                // Verificar se o foco está em um elemento de input
                if (this.shouldIgnoreShortcut(e, key)) {
                    return;
                }
                
                e.preventDefault();
                shortcuts[key](e);
            }
        });
    }

    /**
     * Retorna a representação string do atalho de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     * @returns {string} Representação do atalho
     */
    getKeyboardShortcut(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        
        parts.push(e.key);
        
        return parts.join('+');
    }

    /**
     * Verifica se o atalho deve ser ignorado baseado no contexto
     * @param {KeyboardEvent} e - Evento de teclado
     * @param {string} shortcut - Atalho de teclado
     * @returns {boolean} True se deve ignorar
     */
    shouldIgnoreShortcut(e, shortcut) {
        const activeElement = document.activeElement;
        const isInputElement = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );

        // Enter só deve funcionar no campo de input de tarefas
        if (shortcut === 'Enter') {
            return activeElement !== this.view.elements.taskInput;
        }

        // Outros atalhos não devem funcionar em elementos de input
        if (isInputElement && ['Ctrl+a', 'Ctrl+z', 'Delete', 'F2'].includes(shortcut)) {
            return true;
        }

        return false;
    }

    /**
     * Configura eventos de acessibilidade
     */
    setupAccessibilityEvents() {
        // Navegação por teclado nas tarefas
        this.addGlobalEventListener('keydown', (e) => {
            if (e.target.classList.contains('task-item')) {
                this.handleTaskKeyboard(e);
            }
        });

        // Anúncios para screen readers
        this.setupScreenReaderAnnouncements();
    }

    /**
     * Manipula navegação por teclado nas tarefas
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleTaskKeyboard(e) {
        const currentTask = e.target;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.focusPreviousTask(currentTask);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.focusNextTask(currentTask);
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                this.moveToPreviousColumn(currentTask);
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                this.moveToNextColumn(currentTask);
                break;
                
            case ' ': // Espaço
            case 'Enter':
                e.preventDefault();
                this.selectTask(currentTask);
                break;
        }
    }

    /**
     * Move foco para a tarefa anterior
     * @param {HTMLElement} currentTask - Tarefa atual
     */
    focusPreviousTask(currentTask) {
        const column = currentTask.closest('.task-list');
        const tasks = Array.from(column.querySelectorAll('.task-item'));
        const currentIndex = tasks.indexOf(currentTask);
        
        if (currentIndex > 0) {
            tasks[currentIndex - 1].focus();
        }
    }

    /**
     * Move foco para a próxima tarefa
     * @param {HTMLElement} currentTask - Tarefa atual
     */
    focusNextTask(currentTask) {
        const column = currentTask.closest('.task-list');
        const tasks = Array.from(column.querySelectorAll('.task-item'));
        const currentIndex = tasks.indexOf(currentTask);
        
        if (currentIndex < tasks.length - 1) {
            tasks[currentIndex + 1].focus();
        }
    }

    /**
     * Move para a coluna anterior
     * @param {HTMLElement} currentTask - Tarefa atual
     */
    moveToPreviousColumn(currentTask) {
        const allColumns = Array.from(document.querySelectorAll('.task-list'));
        const currentColumn = currentTask.closest('.task-list');
        const currentColumnIndex = allColumns.indexOf(currentColumn);
        
        if (currentColumnIndex > 0) {
            const previousColumn = allColumns[currentColumnIndex - 1];
            const firstTask = previousColumn.querySelector('.task-item');
            if (firstTask) {
                firstTask.focus();
            }
        }
    }

    /**
     * Move para a próxima coluna
     * @param {HTMLElement} currentTask - Tarefa atual
     */
    moveToNextColumn(currentTask) {
        const allColumns = Array.from(document.querySelectorAll('.task-list'));
        const currentColumn = currentTask.closest('.task-list');
        const currentColumnIndex = allColumns.indexOf(currentColumn);
        
        if (currentColumnIndex < allColumns.length - 1) {
            const nextColumn = allColumns[currentColumnIndex + 1];
            const firstTask = nextColumn.querySelector('.task-item');
            if (firstTask) {
                firstTask.focus();
            }
        }
    }

    /**
     * Seleciona uma tarefa
     * @param {HTMLElement} taskElement - Elemento da tarefa
     */
    selectTask(taskElement) {
        // Remove seleção anterior
        document.querySelectorAll('.task-item.selected').forEach(item => {
            item.classList.remove('selected');
            item.setAttribute('aria-selected', 'false');
        });

        // Seleciona a tarefa atual
        taskElement.classList.add('selected');
        taskElement.setAttribute('aria-selected', 'true');
    }

    /**
     * Configura otimizações de performance
     */
    setupPerformanceOptimizations() {
        // Throttle de eventos de scroll e resize
        this.addGlobalEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16)); // ~60fps

        this.addGlobalEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, this.config.debounceDelay));
    }

    /**
     * Configura anúncios para screen readers
     */
    setupScreenReaderAnnouncements() {
        // Criar elemento para anúncios
        this.ariaLiveElement = document.createElement('div');
        this.ariaLiveElement.setAttribute('aria-live', 'polite');
        this.ariaLiveElement.setAttribute('aria-atomic', 'true');
        this.ariaLiveElement.style.position = 'absolute';
        this.ariaLiveElement.style.left = '-10000px';
        this.ariaLiveElement.style.width = '1px';
        this.ariaLiveElement.style.height = '1px';
        this.ariaLiveElement.style.overflow = 'hidden';
        
        document.body.appendChild(this.ariaLiveElement);
    }

    /**
     * Faz um anúncio para screen readers
     * @param {string} message - Mensagem a ser anunciada
     */
    announceToScreenReader(message) {
        if (this.ariaLiveElement) {
            this.ariaLiveElement.textContent = message;
            
            // Limpar após um tempo para evitar repetições
            setTimeout(() => {
                this.ariaLiveElement.textContent = '';
            }, 1000);
        }
    }

    /**
     * Manipula adição de tarefa
     */
    handleAddTask() {
        if (window.taskController) {
            const success = window.taskController.addTask();
            if (success) {
                this.announceToScreenReader('Nova tarefa adicionada');
            }
        }
    }

    /**
     * Manipula tecla Escape
     */
    handleEscape() {
        // Limpar seleções
        document.querySelectorAll('.task-item.selected').forEach(item => {
            item.classList.remove('selected');
            item.setAttribute('aria-selected', 'false');
        });

        // Limpar campo de input se estiver focado
        if (document.activeElement === this.view.elements.taskInput) {
            this.view.elements.taskInput.value = '';
        }

        // Focar no campo de input
        this.view.elements.taskInput.focus();
    }

    /**
     * Manipula Ctrl+A (selecionar tudo)
     */
    handleSelectAll() {
        const allTasks = document.querySelectorAll('.task-item');
        allTasks.forEach(task => {
            task.classList.add('selected');
            task.setAttribute('aria-selected', 'true');
        });
        
        this.announceToScreenReader(`${allTasks.length} tarefas selecionadas`);
    }

    /**
     * Manipula Ctrl+Z (desfazer)
     */
    handleUndo() {
        // Implementar sistema de undo/redo se necessário
        this.announceToScreenReader('Função de desfazer não implementada');
    }

    /**
     * Manipula Delete (excluir selecionados)
     */
    handleDeleteSelected() {
        const selectedTasks = document.querySelectorAll('.task-item.selected');
        
        if (selectedTasks.length === 0) {
            return;
        }

        const taskIds = Array.from(selectedTasks).map(task => 
            parseFloat(task.dataset.taskId)
        );

        if (confirm(`Excluir ${taskIds.length} tarefa(s) selecionada(s)?`)) {
            taskIds.forEach(id => {
                if (window.taskController) {
                    window.taskController.deleteTask(id);
                }
            });
            
            this.announceToScreenReader(`${taskIds.length} tarefas excluídas`);
        }
    }

    /**
     * Manipula F2 (renomear)
     */
    handleRename() {
        const selectedTask = document.querySelector('.task-item.selected');
        
        if (selectedTask && window.taskController) {
            const taskId = parseFloat(selectedTask.dataset.taskId);
            window.taskController.editTask(taskId);
        }
    }

    /**
     * Manipula evento de scroll
     */
    handleScroll() {
        // Implementar lazy loading ou outras otimizações se necessário
    }

    /**
     * Manipula evento de resize
     */
    handleResize() {
        // Reajustar layout se necessário
        this.view.forceUpdate();
    }

    /**
     * Adiciona event listener global com tracking
     * @param {string} event - Nome do evento
     * @param {Function} handler - Manipulador do evento
     * @param {Object} options - Opções do event listener
     */
    addGlobalEventListener(event, handler, options = {}) {
        document.addEventListener(event, handler, options);
        
        // Track para remoção posterior
        if (!this.activeListeners.has(event)) {
            this.activeListeners.set(event, []);
        }
        this.activeListeners.get(event).push({ handler, options });
    }

    /**
     * Cria função com debounce
     * @param {Function} func - Função a ser executada
     * @param {number} delay - Delay em milliseconds
     * @returns {Function} Função com debounce
     */
    debounce(func, delay) {
        return (...args) => {
            const key = func.toString();
            
            clearTimeout(this.debounceTimers.get(key));
            this.debounceTimers.set(key, setTimeout(() => {
                func.apply(this, args);
            }, delay));
        };
    }

    /**
     * Cria função com throttle
     * @param {Function} func - Função a ser executada
     * @param {number} delay - Delay em milliseconds
     * @returns {Function} Função com throttle
     */
    throttle(func, delay) {
        let lastCall = 0;
        
        return (...args) => {
            const now = Date.now();
            
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    /**
     * Limpa recursos e event listeners
     */
    destroy() {
        // Remover todos os event listeners globais
        this.activeListeners.forEach((listeners, event) => {
            listeners.forEach(({ handler, options }) => {
                document.removeEventListener(event, handler, options);
            });
        });

        // Limpar timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        
        // Remover elemento de anúncios
        if (this.ariaLiveElement && this.ariaLiveElement.parentNode) {
            this.ariaLiveElement.parentNode.removeChild(this.ariaLiveElement);
        }

        // Limpar maps
        this.activeListeners.clear();
        this.debounceTimers.clear();

        console.log('EventHandler destruído');
    }
}