// js/models/TaskModel.js - Gerenciador de Tarefas

/**
 * Classe responsável pelo gerenciamento das tarefas
 * Implementa o padrão Observer para notificar mudanças
 */
class TaskModel {
    /**
     * Construtor do TaskModel
     */
    constructor() {
        this.tasks = [];
        this.observers = [];
        this.storageKey = 'todo_mvc_tasks';
        this.loadTasks();
    }

    /**
     * Adiciona um observer para ser notificado sobre mudanças
     * @param {Object} observer - Objeto que implementa o método update()
     */
    addObserver(observer) {
        if (observer && typeof observer.update === 'function') {
            this.observers.push(observer);
        } else {
            console.error('Observer deve implementar o método update()');
        }
    }

    /**
     * Remove um observer da lista
     * @param {Object} observer - Observer a ser removido
     */
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * Notifica todos os observers sobre mudanças
     */
    notifyObservers() {
        this.observers.forEach(observer => {
            try {
                observer.update();
            } catch (error) {
                console.error('Erro ao notificar observer:', error);
            }
        });
    }

    /**
     * Adiciona uma nova tarefa
     * @param {string} description - Descrição da tarefa
     * @returns {boolean} True se a tarefa foi adicionada com sucesso
     */
    addTask(description) {
        if (!description || !description.trim()) {
            console.error('Descrição da tarefa não pode estar vazia');
            return false;
        }

        try {
            const task = new Task(description);
            this.tasks.push(task);
            this.saveTasks();
            this.notifyObservers();
            return true;
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            return false;
        }
    }

    /**
     * Atualiza a descrição de uma tarefa
     * @param {number} id - ID da tarefa
     * @param {string} newDescription - Nova descrição
     * @returns {boolean} True se a tarefa foi atualizada
     */
    updateTask(id, newDescription) {
        const task = this.findTaskById(id);
        
        if (!task) {
            console.error(`Tarefa com ID ${id} não encontrada`);
            return false;
        }

        if (task.updateDescription(newDescription)) {
            this.saveTasks();
            this.notifyObservers();
            return true;
        }

        return false;
    }

    /**
     * Atualiza o status de uma tarefa
     * @param {number} id - ID da tarefa
     * @param {string} newStatus - Novo status
     * @returns {boolean} True se o status foi atualizado
     */
    updateTaskStatus(id, newStatus) {
        const task = this.findTaskById(id);
        
        if (!task) {
            console.error(`Tarefa com ID ${id} não encontrada`);
            return false;
        }

        if (task.updateStatus(newStatus)) {
            this.saveTasks();
            this.notifyObservers();
            return true;
        }

        return false;
    }

    /**
     * Remove uma tarefa
     * @param {number} id - ID da tarefa a ser removida
     * @returns {boolean} True se a tarefa foi removida
     */
    deleteTask(id) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        
        if (this.tasks.length < initialLength) {
            this.saveTasks();
            this.notifyObservers();
            return true;
        }

        console.error(`Tarefa com ID ${id} não encontrada para remoção`);
        return false;
    }

    /**
     * Busca uma tarefa pelo ID
     * @param {number} id - ID da tarefa
     * @returns {Task|null} Tarefa encontrada ou null
     */
    findTaskById(id) {
        return this.tasks.find(task => task.id === id) || null;
    }

    /**
     * Retorna todas as tarefas
     * @returns {Task[]} Array com todas as tarefas
     */
    getTasks() {
        return [...this.tasks]; // Retorna uma cópia para evitar mutação externa
    }

    /**
     * Retorna tarefas filtradas por status
     * @param {string} status - Status para filtrar ('todo', 'progress', 'done')
     * @returns {Task[]} Array com as tarefas filtradas
     */
    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    /**
     * Retorna estatísticas das tarefas
     * @returns {Object} Objeto com contadores por status
     */
    getStats() {
        const stats = {
            todo: 0,
            progress: 0,
            done: 0,
            total: this.tasks.length
        };

        this.tasks.forEach(task => {
            if (stats.hasOwnProperty(task.status)) {
                stats[task.status]++;
            }
        });

        return stats;
    }

    /**
     * Busca tarefas por texto na descrição
     * @param {string} searchTerm - Termo para busca
     * @returns {Task[]} Array com as tarefas encontradas
     */
    searchTasks(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return this.getTasks();
        }

        const term = searchTerm.toLowerCase().trim();
        return this.tasks.filter(task => 
            task.description.toLowerCase().includes(term)
        );
    }

    /**
     * Salva as tarefas no armazenamento local
     * Nota: Adaptado para funcionar sem localStorage nos artifacts
     */
    saveTasks() {
        // Em um ambiente real, seria:
        // localStorage.setItem(this.storageKey, JSON.stringify(this.tasks.map(task => task.toJSON())));
        
        // Para artifacts, mantemos em memória
        this._savedTasks = this.tasks.map(task => task.toJSON());
    }

    /**
     * Carrega as tarefas do armazenamento local
     * Nota: Adaptado para funcionar sem localStorage nos artifacts
     */
    loadTasks() {
        try {
            // Em um ambiente real, seria:
            // const saved = localStorage.getItem(this.storageKey);
            // if (saved) {
            //     const tasksData = JSON.parse(saved);
            //     this.tasks = tasksData.map(data => Task.fromJSON(data));
            // }

            // Para artifacts, simulamos carregamento
            if (this._savedTasks) {
                this.tasks = this._savedTasks.map(data => Task.fromJSON(data));
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            this.tasks = [];
        }
    }

    /**
     * Limpa todas as tarefas
     * @returns {boolean} True se todas as tarefas foram removidas
     */
    clearAllTasks() {
        const hadTasks = this.tasks.length > 0;
        this.tasks = [];
        
        if (hadTasks) {
            this.saveTasks();
            this.notifyObservers();
        }
        
        return hadTasks;
    }

    /**
     * Move uma tarefa para uma nova posição
     * @param {number} taskId - ID da tarefa
     * @param {number} newIndex - Nova posição
     * @returns {boolean} True se a tarefa foi movida
     */
    moveTask(taskId, newIndex) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1 || newIndex < 0 || newIndex >= this.tasks.length) {
            return false;
        }

        const [task] = this.tasks.splice(taskIndex, 1);
        this.tasks.splice(newIndex, 0, task);
        
        this.saveTasks();
        this.notifyObservers();
        return true;
    }

    /**
     * Exporta todas as tarefas em formato JSON
     * @returns {string} JSON string com todas as tarefas
     */
    exportTasks() {
        return JSON.stringify(this.tasks.map(task => task.toJSON()), null, 2);
    }

    /**
     * Importa tarefas de um JSON
     * @param {string} jsonData - Dados JSON das tarefas
     * @returns {boolean} True se a importação foi bem-sucedida
     */
    importTasks(jsonData) {
        try {
            const tasksData = JSON.parse(jsonData);
            
            if (!Array.isArray(tasksData)) {
                throw new Error('Dados devem ser um array');
            }

            const validTasks = tasksData.filter(Task.isValidTaskData);
            
            if (validTasks.length !== tasksData.length) {
                console.warn('Algumas tarefas foram ignoradas por serem inválidas');
            }

            this.tasks = validTasks.map(data => Task.fromJSON(data));
            this.saveTasks();
            this.notifyObservers();
            return true;
        } catch (error) {
            console.error('Erro ao importar tarefas:', error);
            return false;
        }
    }
}