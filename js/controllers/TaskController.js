// js/controllers/TaskController.js - Controlador Principal

/**
 * Classe responsável pela coordenação entre Model e View
 * Implementa a lógica de negócio e manipulação de eventos
 */
class TaskController {
    /**
     * Construtor do TaskController
     * @param {TaskModel} model - Instância do modelo
     * @param {TaskView} view - Instância da view
     */
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Inicializa o controller
     */
    init() {
        if (this.isInitialized) {
            console.warn('Controller já foi inicializado');
            return;
        }

        // Conecta o modelo à view através do padrão Observer
        this.model.addObserver(this.view);
        
        // Renderização inicial
        this.view.render();
        
        // Adiciona algumas tarefas de exemplo se não existirem
        this.initializeSampleData();
        
        this.isInitialized = true;
        console.log('TaskController inicializado com sucesso');
    }

    /**
     * Adiciona dados de exemplo se não existirem tarefas
     */
    initializeSampleData() {
        const stats = this.model.getStats();
        
        if (stats.total === 0) {
            const sampleTasks = [
                'Implementar sistema de login',
                'Criar documentação da API',
                'Fazer testes unitários',
                'Configurar deploy automático',
                'Revisar código da equipe'
            ];

            // Adiciona tarefas de exemplo
            sampleTasks.forEach((description, index) => {
                if (this.model.addTask(description)) {
                    const tasks = this.model.getTasks();
                    const lastTask = tasks[tasks.length - 1];
                    
                    // Distribui as tarefas entre os status
                    if (index === 1) {
                        this.model.updateTaskStatus(lastTask.id, 'progress');
                    } else if (index === 2 || index === 4) {
                        this.model.updateTaskStatus(lastTask.id, 'done');
                    }
                }
            });

            this.view.showMessage('Tarefas de exemplo carregadas!', 'info');
        }
    }

    /**
     * Adiciona uma nova tarefa
     * @param {string} description - Descrição da tarefa (opcional, pega do input se não fornecida)
     * @returns {boolean} True se a tarefa foi adicionada com sucesso
     */
    addTask(description = null) {
        try {
            const taskDescription = description || this.view.getTaskInputValue();
            
            if (!taskDescription) {
                this.view.showMessage('Por favor, digite uma descrição para a tarefa', 'error');
                return false;
            }

            if (taskDescription.length > 200) {
                this.view.showMessage('Descrição muito longa (máximo 200 caracteres)', 'error');
                return false;
            }

            const success = this.model.addTask(taskDescription);
            
            if (success) {
                this.view.clearTaskInput();
                this.view.showMessage('Tarefa adicionada com sucesso!', 'success');
                return true;
            } else {
                this.view.showMessage('Erro ao adicionar tarefa', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro no addTask:', error);
            this.view.showMessage('Erro inesperado ao adicionar tarefa', 'error');
            return false;
        }
    }

    /**
     * Edita uma tarefa existente
     * @param {number} taskId - ID da tarefa a ser editada
     * @returns {boolean} True se a tarefa foi editada com sucesso
     */
    editTask(taskId) {
        try {
            const task = this.model.findTaskById(taskId);
            
            if (!task) {
                this.view.showMessage('Tarefa não encontrada', 'error');
                return false;
            }

            const newDescription = prompt(
                'Digite a nova descrição:', 
                task.description
            );

            if (newDescription === null) {
                // Usuário cancelou
                return false;
            }

            if (!newDescription.trim()) {
                this.view.showMessage('Descrição não pode estar vazia', 'error');
                return false;
            }

            if (newDescription.length > 200) {
                this.view.showMessage('Descrição muito longa (máximo 200 caracteres)', 'error');
                return false;
            }

            const success = this.model.updateTask(taskId, newDescription.trim());
            
            if (success) {
                this.view.showMessage('Tarefa atualizada com sucesso!', 'success');
                return true;
            } else {
                this.view.showMessage('Nenhuma alteração foi feita', 'info');
                return false;
            }
        } catch (error) {
            console.error('Erro no editTask:', error);
            this.view.showMessage('Erro inesperado ao editar tarefa', 'error');
            return false;
        }
    }

    /**
     * Atualiza o status de uma tarefa (usado pelo drag & drop)
     * @param {number} taskId - ID da tarefa
     * @param {string} newStatus - Novo status
     * @returns {boolean} True se o status foi atualizado
     */
    updateTaskStatus(taskId, newStatus) {
        try {
            const validStatuses = ['todo', 'progress', 'done'];
            
            if (!validStatuses.includes(newStatus)) {
                console.error('Status inválido:', newStatus);
                return false;
            }

            const task = this.model.findTaskById(taskId);
            if (!task) {
                this.view.showMessage('Tarefa não encontrada', 'error');
                return false;
            }

            const oldStatus = task.status;
            const success = this.model.updateTaskStatus(taskId, newStatus);
            
            if (success) {
                const statusNames = {
                    'todo': 'Para Fazer',
                    'progress': 'Em Progresso',
                    'done': 'Concluída'
                };
                
                this.view.showMessage(
                    `Tarefa movida para "${statusNames[newStatus]}"`, 
                    'success'
                );
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro no updateTaskStatus:', error);
            this.view.showMessage('Erro ao atualizar status da tarefa', 'error');
            return false;
        }
    }

    /**
     * Remove uma tarefa
     * @param {number} taskId - ID da tarefa a ser removida
     * @returns {boolean} True se a tarefa foi removida
     */
    deleteTask(taskId) {
        try {
            const task = this.model.findTaskById(taskId);
            
            if (!task) {
                this.view.showMessage('Tarefa não encontrada', 'error');
                return false;
            }

            const confirmMessage = `Tem certeza que deseja excluir a tarefa:\n"${task.description}"?`;
            
            if (!confirm(confirmMessage)) {
                return false;
            }

            const success = this.model.deleteTask(taskId);
            
            if (success) {
                this.view.showMessage('Tarefa excluída com sucesso!', 'success');
                return true;
            } else {
                this.view.showMessage('Erro ao excluir tarefa', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro no deleteTask:', error);
            this.view.showMessage('Erro inesperado ao excluir tarefa', 'error');
            return false;
        }
    }

    /**
     * Move uma tarefa para uma nova posição
     * @param {number} taskId - ID da tarefa
     * @param {number} newIndex - Nova posição
     * @returns {boolean} True se a tarefa foi movida
     */
    moveTask(taskId, newIndex) {
        try {
            return this.model.moveTask(taskId, newIndex);
        } catch (error) {
            console.error('Erro no moveTask:', error);
            return false;
        }
    }

    /**
     * Limpa todas as tarefas após confirmação
     * @returns {boolean} True se todas as tarefas foram removidas
     */
    clearAllTasks() {
        try {
            const stats = this.model.getStats();
            
            if (stats.total === 0) {
                this.view.showMessage('Não há tarefas para remover', 'info');
                return false;
            }

            const confirmMessage = `Tem certeza que deseja excluir todas as ${stats.total} tarefas?\nEsta ação não pode ser desfeita.`;
            
            if (!confirm(confirmMessage)) {
                return false;
            }

            const success = this.model.clearAllTasks();
            
            if (success) {
                this.view.showMessage('Todas as tarefas foram excluídas', 'success');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro no clearAllTasks:', error);
            this.view.showMessage('Erro ao limpar tarefas', 'error');
            return false;
        }
    }

    /**
     * Busca tarefas por texto
     * @param {string} searchTerm - Termo de busca
     * @returns {Task[]} Tarefas encontradas
     */
    searchTasks(searchTerm) {
        try {
            return this.model.searchTasks(searchTerm);
        } catch (error) {
            console.error('Erro na busca:', error);
            this.view.showMessage('Erro ao buscar tarefas', 'error');
            return [];
        }
    }

    /**
     * Exporta todas as tarefas
     * @returns {string|null} JSON das tarefas ou null em caso de erro
     */
    exportTasks() {
        try {
            const jsonData = this.model.exportTasks();
            this.view.showMessage('Tarefas exportadas com sucesso!', 'success');
            return jsonData;
        } catch (error) {
            console.error('Erro na exportação:', error);
            this.view.showMessage('Erro ao exportar tarefas', 'error');
            return null;
        }
    }

    /**
     * Importa tarefas de um JSON
     * @param {string} jsonData - Dados JSON
     * @returns {boolean} True se a importação foi bem-sucedida
     */
    importTasks(jsonData) {
        try {
            const success = this.model.importTasks(jsonData);
            
            if (success) {
                this.view.showMessage('Tarefas importadas com sucesso!', 'success');
                return true;
            } else {
                this.view.showMessage('Erro ao importar tarefas', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro na importação:', error);
            this.view.showMessage('Erro ao processar arquivo de importação', 'error');
            return false;
        }
    }

    /**
     * Obtém estatísticas das tarefas
     * @returns {Object} Estatísticas
     */
    getStats() {
        return this.model.getStats();
    }

    /**
     * Força uma atualização da view
     */
    refresh() {
        try {
            this.view.forceUpdate();
        } catch (error) {
            console.error('Erro ao atualizar view:', error);
        }
    }

    /**
     * Limpa recursos e desconecta observadores
     */
    destroy() {
        try {
            this.model.removeObserver(this.view);
            this.view.destroy();
            this.isInitialized = false;
            console.log('TaskController destruído');
        } catch (error) {
            console.error('Erro ao destruir controller:', error);
        }
    }
}