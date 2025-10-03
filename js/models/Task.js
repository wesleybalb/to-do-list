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
        this.detailedDescription = '';
        this.urgencyLevel = 'normal'; // 'baixa', 'normal', 'urgente
        this.priority = 'normal'; // 🆕 ADICIONAR: 'urgente', 'normal', 'baixa'
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

/** * Atualiza a descrição detalhada da tarefa
 * @param {string} newDetailedDescription - Nova descrição detalhada
 * @returns {boolean} True se foi atualizada com sucesso
 */
updateDetailedDescription(newDetailedDescription) {
    const trimmedDescription = (newDetailedDescription || '').trim();
    
    if (this.detailedDescription !== trimmedDescription) {
        this.detailedDescription = trimmedDescription;
        this.updatedAt = new Date();
        return true;
    }
    
    return false;
}

/**
 * Atualiza o nível de urgência da tarefa
 * @param {string} newUrgencyLevel - Novo nível ('baixa', 'normal', 'urgente')
 * @returns {boolean} True se foi atualizado com sucesso
 */
updateUrgencyLevel(newUrgencyLevel) {
    const validLevels = ['baixa', 'normal', 'urgente'];
    
    if (!validLevels.includes(newUrgencyLevel)) {
        console.error(`Nível de urgência inválido: ${newUrgencyLevel}`);
        return false;
    }

    if (this.urgencyLevel !== newUrgencyLevel) {
        this.urgencyLevel = newUrgencyLevel;
        this.updatedAt = new Date();
        return true;
    }
    
    return false;
}

    /**
 * Atualiza a prioridade da tarefa
 * @param {string} newPriority - Nova prioridade ('urgente', 'normal', 'baixa')
 * @returns {boolean} True se foi atualizada com sucesso
 */
updatePriority(newPriority) {
    const validPriorities = ['urgente', 'normal', 'baixa'];
    
    if (!validPriorities.includes(newPriority)) {
        console.error(`Prioridade inválida: ${newPriority}`);
        return false;
    }

    if (this.priority !== newPriority) {
        this.priority = newPriority;
        this.updatedAt = new Date();
        return true;
    }
    
    return false;
}

/**
 * Retorna o valor numérico da prioridade para ordenação
 * @returns {number} Valor numérico (3=urgente, 2=normal, 1=baixa)
 */
getPriorityValue() {
    const priorityValues = {
        'urgente': 3,
        'normal': 2,
        'baixa': 1
    };
    return priorityValues[this.priority] || 2;
}

/**
 * Retorna o ícone da prioridade
 * @returns {string} Emoji do ícone
 */
getPriorityIcon() {
    const priorityIcons = {
        'urgente': '🔥',
        'normal': '📋',
        'baixa': '📝'
    };
    return priorityIcons[this.priority] || '📋';
}

/**
 * Retorna a cor da prioridade
 * @returns {string} Código da cor
 */
getPriorityColor() {
    const priorityColors = {
        'urgente': '#dc3545',
        'normal': '#ffc107', 
        'baixa': '#28a745'
    };
    return priorityColors[this.priority] || '#ffc107';
}

    /**
     * Retorna uma representação simplificada da tarefa para serialização
     * @returns {Object} Objeto com os dados da tarefa
     */
toJSON() {
    return {
        id: this.id,
        description: this.description,
        detailedDescription: this.detailedDescription,
        urgencyLevel: this.urgencyLevel,
        priority: this.priority, // 🆕 ADICIONAR
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
    task.detailedDescription = data.detailedDescription || '';
    task.urgencyLevel = data.urgencyLevel || 'normal';
    task.priority = data.priority || 'normal'; // 🆕 ADICIONAR
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
    const validUrgencyLevels = ['baixa', 'normal', 'urgente'];
    const validPriorities = ['baixa', 'normal', 'urgente']; // 🆕 ADICIONAR
    
    return (
        data &&
        typeof data.id === 'number' &&
        typeof data.description === 'string' &&
        data.description.trim() !== '' &&
        ['todo', 'progress', 'done'].includes(data.status) &&
        (data.detailedDescription === undefined || typeof data.detailedDescription === 'string') &&
        (data.urgencyLevel === undefined || validUrgencyLevels.includes(data.urgencyLevel)) &&
        (data.priority === undefined || validPriorities.includes(data.priority)) // 🆕 ADICIONAR
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
