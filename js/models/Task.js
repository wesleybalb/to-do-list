// js/models/Task.js - Modelo de Dados da Tarefa

/**
 * Classe que representa uma tarefa individual
 * Contém ID único, descrição, status e data de criação
 */
class Task {
    /**
     * Construtor da classe Task
     * @param {string} description - Descrição da tarefa
     */
    constructor(description) {
        this.id = this.generateId();
        this.description = description.trim();
        this.status = 'todo'; // Estados possíveis: 'todo', 'progress', 'done'
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Gera um ID único para a tarefa
     * @returns {number} ID único baseado em timestamp e número aleatório
     */
    generateId() {
        return Date.now() + Math.random();
    }

    /**
     * Atualiza o status da tarefa
     * @param {string} newStatus - Novo status ('todo', 'progress', 'done')
     * @returns {boolean} True se o status foi atualizado com sucesso
     */
    updateStatus(newStatus) {
        const validStatuses = ['todo', 'progress', 'done'];
        
        if (!validStatuses.includes(newStatus)) {
            console.error(`Status inválido: ${newStatus}`);
            return false;
        }

        if (this.status !== newStatus) {
            this.status = newStatus;
            this.updatedAt = new Date();
            return true;
        }
        
        return false;
    }

    /**
     * Atualiza a descrição da tarefa
     * @param {string} newDescription - Nova descrição
     * @returns {boolean} True se a descrição foi atualizada com sucesso
     */
    updateDescription(newDescription) {
        const trimmedDescription = newDescription.trim();
        
        if (!trimmedDescription) {
            console.error('Descrição não pode estar vazia');
            return false;
        }

        if (this.description !== trimmedDescription) {
            this.description = trimmedDescription;
            this.updatedAt = new Date();
            return true;
        }
        
        return false;
    }

    /**
     * Retorna uma representação simplificada da tarefa para serialização
     * @returns {Object} Objeto com os dados da tarefa
     */
    toJSON() {
        return {
            id: this.id,
            description: this.description,
            status: this.status,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    /**
     * Cria uma instância de Task a partir de dados serializados
     * @param {Object} data - Dados da tarefa
     * @returns {Task} Nova instância de Task
     */
    static fromJSON(data) {
        const task = Object.create(Task.prototype);
        task.id = data.id;
        task.description = data.description;
        task.status = data.status;
        task.createdAt = new Date(data.createdAt);
        task.updatedAt = new Date(data.updatedAt);
        return task;
    }

    /**
     * Valida se os dados de uma tarefa são válidos
     * @param {Object} data - Dados para validação
     * @returns {boolean} True se os dados são válidos
     */
    static isValidTaskData(data) {
        return (
            data &&
            typeof data.id === 'number' &&
            typeof data.description === 'string' &&
            data.description.trim() !== '' &&
            ['todo', 'progress', 'done'].includes(data.status)
        );
    }

    /**
     * Retorna o ID formatado para exibição
     * @returns {string} ID formatado com 4 dígitos
     */
    getFormattedId() {
        return `#${this.id.toString().slice(-4)}`;
    }

    /**
     * Retorna o tempo decorrido desde a criação da tarefa
     * @returns {string} Tempo formatado (ex: "há 2 dias")
     */
    getTimeAgo() {
        const now = new Date();
        const diffMs = now - this.createdAt;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else if (diffMinutes > 0) {
            return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
        } else {
            return 'agora mesmo';
        }
    }
}