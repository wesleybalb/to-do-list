// js/utils/DragDropHandler.js - Manipulação de Drag & Drop

/**
 * Classe responsável pela funcionalidade de arrastar e soltar tarefas
 * Gerencia todas as interações de drag & drop entre as colunas
 */
class DragDropHandler {
    /**
     * Construtor do DragDropHandler
     * @param {TaskView} view - Instância da view
     */
    constructor(view) {
        this.view = view;
        this.draggedElement = null;
        this.draggedTaskId = null;
        this.isDragging = false;
        this.dropZones = [];
        
        // Configurações de drag & drop
        this.config = {
            dragDelay: 100, // ms antes de iniciar o drag
            dragOpacity: 0.5,
            dragRotation: 5, // graus
            dropZoneOpacity: 0.1,
            animationDuration: 300 // ms
        };
    }

    /**
     * Inicializa o sistema de drag & drop
     */
    init() {
        this.setupDropZones();
        this.setupGlobalEventListeners();
        console.log('DragDropHandler inicializado');
    }

    /**
     * Configura as zonas de drop (colunas)
     */
    setupDropZones() {
        this.dropZones = [
            { element: this.view.elements.todoList, status: 'todo' },
            { element: this.view.elements.progressList, status: 'progress' },
            { element: this.view.elements.doneList, status: 'done' }
        ];

        this.dropZones.forEach(zone => {
            this.setupDropZone(zone.element);
        });
    }

    /**
     * Configura uma zona de drop específica
     * @param {HTMLElement} element - Elemento da zona de drop
     */
    setupDropZone(element) {
        // Remove event listeners existentes
        element.removeEventListener('dragover', this.handleDragOver.bind(this));
        element.removeEventListener('dragenter', this.handleDragEnter.bind(this));
        element.removeEventListener('dragleave', this.handleDragLeave.bind(this));
        element.removeEventListener('drop', this.handleDrop.bind(this));

        // Adiciona novos event listeners
        element.addEventListener('dragover', this.handleDragOver.bind(this));
        element.addEventListener('dragenter', this.handleDragEnter.bind(this));
        element.addEventListener('dragleave', this.handleDragLeave.bind(this));
        element.addEventListener('drop', this.handleDrop.bind(this));
    }

    /**
     * Configura elementos de tarefa para drag
     * @param {HTMLElement} container - Container com as tarefas
     */
    setupTaskElements(container) {
        const taskItems = container.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            // Remove event listeners existentes
            item.removeEventListener('dragstart', this.handleDragStart.bind(this));
            item.removeEventListener('dragend', this.handleDragEnd.bind(this));
            item.removeEventListener('drag', this.handleDrag.bind(this));

            // Adiciona novos event listeners
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
            item.addEventListener('drag', this.handleDrag.bind(this));

            // Configurações de acessibilidade
            item.setAttribute('role', 'button');
            item.setAttribute('aria-grabbed', 'false');
            item.setAttribute('tabindex', '0');
        });
    }

    /**
     * Configura event listeners globais
     */
    setupGlobalEventListeners() {
        // Previne drag & drop padrão do browser em toda a página
        document.addEventListener('dragover', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });

        document.addEventListener('drop', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    /**
     * Manipula o início do drag
     * @param {DragEvent} e - Evento de drag start
     */
    handleDragStart(e) {
        this.isDragging = true;
        this.draggedElement = e.target;
        this.draggedTaskId = parseFloat(e.target.dataset.taskId);

        // Configurações visuais
        e.target.classList.add('dragging');
        e.target.style.opacity = this.config.dragOpacity;
        e.target.style.transform = `rotate(${this.config.dragRotation}deg)`;
        e.target.setAttribute('aria-grabbed', 'true');

        // Configurar dados do drag
        e.dataTransfer.setData('text/plain', this.draggedTaskId.toString());
        e.dataTransfer.setData('application/json', JSON.stringify({
            taskId: this.draggedTaskId,
            sourceStatus: e.target.dataset.status
        }));

        e.dataTransfer.effectAllowed = 'move';

        // Criar imagem de drag personalizada
        this.createDragImage(e);

        // Adicionar feedback visual às zonas de drop
        this.highlightDropZones(true);

        console.log(`Iniciando drag da tarefa ${this.draggedTaskId}`);
    }

    /**
     * Cria uma imagem personalizada para o drag
     * @param {DragEvent} e - Evento de drag
     */
    createDragImage(e) {
        try {
            const clone = e.target.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.top = '-1000px';
            clone.style.opacity = '0.8';
            clone.style.transform = 'rotate(3deg) scale(1.05)';
            clone.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            
            document.body.appendChild(clone);
            
            setTimeout(() => {
                if (document.body.contains(clone)) {
                    document.body.removeChild(clone);
                }
            }, 100);

            e.dataTransfer.setDragImage(clone, 0, 0);
        } catch (error) {
            console.warn('Erro ao criar imagem de drag:', error);
        }
    }

    /**
     * Manipula o evento durante o drag
     * @param {DragEvent} e - Evento de drag
     */
    handleDrag(e) {
        // Atualizar posição do cursor para feedback visual
        if (this.isDragging) {
            // Adicionar efeitos visuais adicionais se necessário
        }
    }

    /**
     * Manipula o final do drag
     * @param {DragEvent} e - Evento de drag end
     */
    handleDragEnd(e) {
        this.isDragging = false;
        
        // Remover classes e estilos visuais
        e.target.classList.remove('dragging');
        e.target.style.opacity = '';
        e.target.style.transform = '';
        e.target.setAttribute('aria-grabbed', 'false');

        // Remover destaque das zonas de drop
        this.highlightDropZones(false);

        // Limpar referências
        this.draggedElement = null;
        this.draggedTaskId = null;

        console.log('Drag finalizado');
    }

    /**
     * Manipula drag over nas zonas de drop
     * @param {DragEvent} e - Evento de drag over
     */
    handleDragOver(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Manipula drag enter nas zonas de drop
     * @param {DragEvent} e - Evento de drag enter
     */
    handleDragEnter(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        if (e.target.classList.contains('task-list')) {
            e.target.classList.add('drag-over');
            this.addDropZoneAnimation(e.target);
        }
    }

    /**
     * Manipula drag leave nas zonas de drop
     * @param {DragEvent} e - Evento de drag leave
     */
    handleDragLeave(e) {
        if (!this.isDragging) return;
        
        // Verificar se realmente saiu da zona (não é um elemento filho)
        if (!e.target.contains(e.relatedTarget)) {
            e.target.classList.remove('drag-over');
            this.removeDropZoneAnimation(e.target);
        }
    }

    /**
     * Manipula o drop nas zonas
     * @param {DragEvent} e - Evento de drop
     */
    handleDrop(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        e.target.classList.remove('drag-over');
        this.removeDropZoneAnimation(e.target);

        try {
            // Obter dados do drag
            const taskId = parseFloat(e.dataTransfer.getData('text/plain'));
            const dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            
            // Determinar novo status baseado na zona de drop
            const newStatus = e.target.dataset.status;
            
            if (!taskId || !newStatus) {
                console.error('Dados de drop inválidos');
                return;
            }

            // Verificar se houve mudança real de status
            if (dragData.sourceStatus === newStatus) {
                console.log('Tarefa solta na mesma coluna');
                return;
            }

            // Executar a mudança de status através do controller
            const success = window.taskController.updateTaskStatus(taskId, newStatus);
            
            if (success) {
                this.animateSuccessfulDrop(e.target);
            }

        } catch (error) {
            console.error('Erro durante o drop:', error);
            this.view.showMessage('Erro ao mover tarefa', 'error');
        }
    }

    /**
     * Destaca ou remove destaque das zonas de drop
     * @param {boolean} highlight - Se deve destacar ou não
     */
    highlightDropZones(highlight) {
        this.dropZones.forEach(zone => {
            if (highlight) {
                zone.element.style.borderColor = '#667eea';
                zone.element.style.backgroundColor = `rgba(102, 126, 234, ${this.config.dropZoneOpacity})`;
            } else {
                zone.element.style.borderColor = '';
                zone.element.style.backgroundColor = '';
            }
        });
    }

    /**
     * Adiciona animação à zona de drop
     * @param {HTMLElement} element - Elemento da zona
     */
    addDropZoneAnimation(element) {
        element.style.transform = 'scale(1.02)';
        element.style.transition = `transform ${this.config.animationDuration}ms ease`;
    }

    /**
     * Remove animação da zona de drop
     * @param {HTMLElement} element - Elemento da zona
     */
    removeDropZoneAnimation(element) {
        element.style.transform = '';
    }

    /**
     * Anima drop bem-sucedido
     * @param {HTMLElement} element - Elemento da zona onde foi feito o drop
     */
    animateSuccessfulDrop(element) {
        const originalBg = element.style.backgroundColor;
        
        element.style.backgroundColor = 'rgba(102, 187, 106, 0.3)';
        element.style.transition = `background-color ${this.config.animationDuration}ms ease`;
        
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, this.config.animationDuration);
    }

    /**
     * Verifica se o drag & drop é suportado
     * @returns {boolean} True se suportado
     */
    isDragDropSupported() {
        const div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    }

    /**
     * Habilita ou desabilita drag & drop
     * @param {boolean} enabled - Se deve estar habilitado
     */
    setEnabled(enabled) {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            item.draggable = enabled;
            item.style.cursor = enabled ? 'grab' : 'default';
        });

        if (!enabled) {
            this.highlightDropZones(false);
        }
    }

    /**
     * Limpa recursos e event listeners
     */
    destroy() {
        // Remover event listeners das zonas de drop
        this.dropZones.forEach(zone => {
            zone.element.removeEventListener('dragover', this.handleDragOver);
            zone.element.removeEventListener('dragenter', this.handleDragEnter);
            zone.element.removeEventListener('dragleave', this.handleDragLeave);
            zone.element.removeEventListener('drop', this.handleDrop);
        });

        // Remover event listeners das tarefas
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            item.removeEventListener('dragstart', this.handleDragStart);
            item.removeEventListener('dragend', this.handleDragEnd);
            item.removeEventListener('drag', this.handleDrag);
        });

        // Limpar propriedades
        this.draggedElement = null;
        this.draggedTaskId = null;
        this.isDragging = false;
        this.dropZones = [];

        console.log('DragDropHandler destruído');
    }
}