// js/app.js - Inicialização com Injeção de Dependência (VERSÃO MELHOR)

/**
 * Classe principal da aplicação TO-DO List MVC
 * VERSÃO MELHORADA: Usa injeção de dependência em vez de referências globais
 */
class TodoApp {
    /**
     * Construtor da aplicação
     */
    constructor() {
        this.model = null;
        this.view = null;
        this.controller = null;
        this.isInitialized = false;
        
        // Configurações da aplicação
        this.config = {
            appName: 'TO-DO List MVC',
            version: '1.0.0',
            debugMode: false,
            autoSave: true,
            theme: 'light'
        };
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log(`Inicializando ${this.config.appName} v${this.config.version}`);
            
            // Verificar compatibilidade do browser
            if (!this.checkBrowserCompatibility()) {
                this.showCompatibilityError();
                return false;
            }

            // Aguardar carregamento completo do DOM
            if (document.readyState === 'loading') {
                await this.waitForDOMReady();
            }

            // Inicializar componentes MVC com injeção de dependência
            await this.initializeComponentsWithDI();
            
            // Configurar aplicação
            this.setupApplication();
            
            // Registrar service worker se disponível
            this.registerServiceWorker();
            
            this.isInitialized = true;
            console.log('Aplicação inicializada com sucesso');
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.showInitializationError(error);
            return false;
        }
    }

    /**
     * Inicializa componentes MVC usando injeção de dependência
     * Esta é a versão MELHOR que evita dependências globais
     */
    async initializeComponentsWithDI() {
        console.log('Inicializando componentes MVC com injeção de dependência...');

        // PASSO 1: Inicializar Model (sem dependências)
        this.model = new TaskModel();
        console.log('✓ TaskModel inicializado');

        // PASSO 2: Inicializar View passando o Model como dependência
        this.view = new TaskView(this.model);
        console.log('✓ TaskView inicializado com modelo injetado');

        // PASSO 3: Inicializar Controller passando Model e View
        this.controller = new TaskController(this.model, this.view);
        console.log('✓ TaskController inicializado com dependências injetadas');

        // PASSO 4: Tornar componentes acessíveis globalmente apenas para callbacks HTML
        // (mantido por compatibilidade com onclick nos botões)
        window.taskModel = this.model;
        window.taskView = this.view;
        window.taskController = this.controller;
    }

    /**
     * Versão alternativa usando referências globais (para compatibilidade)
     * Use esta se tiver problemas com a versão de injeção de dependência
     */
    async initializeComponents() {
        console.log('Inicializando componentes MVC...');

        // PASSO 1: Inicializar Model
        this.model = new TaskModel();
        console.log('✓ TaskModel inicializado');

        // PASSO 2: Tornar model acessível globalmente IMEDIATAMENTE
        window.taskModel = this.model;

        // PASSO 3: Inicializar View (agora o model já está disponível globalmente)
        this.view = new TaskView();
        console.log('✓ TaskView inicializado');

        // PASSO 4: Tornar view acessível globalmente
        window.taskView = this.view;

        // PASSO 5: Inicializar Controller
        this.controller = new TaskController(this.model, this.view);
        console.log('✓ TaskController inicializado');

        // PASSO 6: Tornar controller acessível globalmente
        window.taskController = this.controller;
    }

    /**
     * Verifica compatibilidade do browser
     * @returns {boolean} True se compatível
     */
    checkBrowserCompatibility() {
        const requiredFeatures = {
            'localStorage': typeof Storage !== 'undefined',
            'classList': 'classList' in document.createElement('div'),
            'querySelector': 'querySelector' in document,
            'JSON': typeof JSON !== 'undefined',
            'dragAndDrop': 'draggable' in document.createElement('div')
        };

        const missingFeatures = Object.entries(requiredFeatures)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);

        if (missingFeatures.length > 0) {
            console.warn('Recursos não suportados:', missingFeatures);
            return false;
        }

        return true;
    }

    /**
     * Aguarda o carregamento completo do DOM
     */
    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', resolve);
            }
        });
    }

    /**
     * Configura a aplicação após inicialização dos componentes
     */
    setupApplication() {
        document.title = this.config.appName;
        this.setupMetaTags();
        this.setupErrorHandlers();
        this.setupLifecycleEvents();
        this.applyTheme(this.config.theme);

        if (this.config.autoSave) {
            this.setupAutoSave();
        }

        console.log('Configuração da aplicação concluída');
    }

    setupMetaTags() {
        const metaTags = {
            'description': 'Sistema de gerenciamento de tarefas com arquitetura MVC',
            'author': 'TO-DO List MVC',
            'keywords': 'todo, tarefas, mvc, javascript, drag-drop',
            'viewport': 'width=device-width, initial-scale=1.0'
        };

        Object.entries(metaTags).forEach(([name, content]) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = name;
                document.head.appendChild(meta);
            }
            meta.content = content;
        });
    }

    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            console.error('Erro JavaScript:', event.error);
            this.handleGlobalError(event.error, 'JavaScript Error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada:', event.reason);
            this.handleGlobalError(event.reason, 'Unhandled Promise Rejection');
            event.preventDefault();
        });
    }

    handleGlobalError(error, type) {
        if (this.config.debugMode) {
            console.group(`🚨 ${type}`);
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            console.groupEnd();
        }

        if (this.view && this.view.showMessage) {
            this.view.showMessage('Ops! Algo deu errado. Tente novamente.', 'error');
        }
    }

    setupLifecycleEvents() {
        window.addEventListener('beforeunload', (event) => {
            this.handleBeforeUnload(event);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });

        window.addEventListener('focus', () => this.handleAppFocus());
        window.addEventListener('blur', () => this.handleAppBlur());
    }

    handleBeforeUnload(event) {
        if (this.model) {
            this.model.saveTasks();
        }
    }

    handlePageHidden() {
        if (this.config.debugMode) {
            console.log('Página oculta - pausando operações não essenciais');
        }
        
        if (this.model) {
            this.model.saveTasks();
        }
    }

    handlePageVisible() {
        if (this.config.debugMode) {
            console.log('Página visível - retomando operações');
        }
        
        if (this.view) {
            this.view.forceUpdate();
        }
    }

    handleAppFocus() {
        if (this.config.debugMode) {
            console.log('Aplicação em foco');
        }
    }

    handleAppBlur() {
        if (this.config.debugMode) {
            console.log('Aplicação fora de foco');
        }
    }

    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        
        try {
            localStorage.setItem('todo_theme', theme);
        } catch (error) {
            console.warn('Não foi possível salvar tema:', error);
        }
    }

    setupAutoSave() {
        if (!this.model) return;

        setInterval(() => {
            this.model.saveTasks();
            if (this.config.debugMode) {
                console.log('Auto-save executado');
            }
        }, 30000);
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                if (this.config.debugMode) {
                    console.log('Service Worker não disponível neste ambiente');
                }
            } catch (error) {
                console.warn('Erro ao registrar Service Worker:', error);
            }
        }
    }

    showCompatibilityError() {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
                z-index: 10000;
            ">
                <h2 style="color: #e53e3e; margin-bottom: 15px;">
                    ⚠️ Navegador Não Suportado
                </h2>
                <p style="margin-bottom: 20px; line-height: 1.5;">
                    Seu navegador não suporta todos os recursos necessários para esta aplicação.
                    Por favor, atualize seu navegador ou use uma versão mais recente.
                </p>
                <p style="font-size: 14px; color: #666;">
                    Navegadores recomendados: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
                </p>
            </div>
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            "></div>
        `;

        document.body.innerHTML = errorHTML;
    }

    showInitializationError(error) {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
                z-index: 10000;
            ">
                <h2 style="color: #e53e3e; margin-bottom: 15px;">
                    🚨 Erro de Inicialização
                </h2>
                <p style="margin-bottom: 20px; line-height: 1.5;">
                    Ocorreu um erro ao inicializar a aplicação.
                    Por favor, recarregue a página.
                </p>
                <button onclick="window.location.reload()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    🔄 Recarregar Página
                </button>
                ${this.config.debugMode ? `
                    <details style="margin-top: 20px; text-align: left;">
                        <summary style="cursor: pointer; color: #666;">
                            Detalhes do erro (para desenvolvedores)
                        </summary>
                        <pre style="
                            background: #f5f5f5;
                            padding: 10px;
                            border-radius: 5px;
                            font-size: 12px;
                            overflow: auto;
                            max-height: 200px;
                            margin-top: 10px;
                        ">${error.stack || error.message}</pre>
                    </details>
                ` : ''}
            </div>
        `;

        document.body.innerHTML = errorHTML;
    }

    getAppInfo() {
        return {
            ...this.config,
            initialized: this.isInitialized,
            components: {
                model: !!this.model,
                view: !!this.view,
                controller: !!this.controller
            },
            stats: this.model ? this.model.getStats() : null
        };
    }

    async restart() {
        console.log('Reiniciando aplicação...');
        
        if (this.controller) {
            this.controller.destroy();
        }
        if (this.view) {
            this.view.destroy();
        }

        delete window.taskModel;
        delete window.taskView;
        delete window.taskController;

        this.model = null;
        this.view = null;
        this.controller = null;
        this.isInitialized = false;

        await this.init();
    }

    destroy() {
        if (this.controller) {
            this.controller.destroy();
        }
        if (this.view) {
            this.view.destroy();
        }

        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleGlobalError);

        delete window.taskModel;
        delete window.taskView;
        delete window.taskController;
        delete window.todoApp;

        this.isInitialized = false;
        console.log('Aplicação destruída');
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado, inicializando aplicação...');
    
    window.todoApp = new TodoApp();
    const success = await window.todoApp.init();
    
    if (success) {
        console.log('🎉 TO-DO List MVC pronto para uso!');
        
        if (window.todoApp.config.debugMode) {
            window.debug = {
                app: window.todoApp,
                model: window.taskModel,
                view: window.taskView,
                controller: window.taskController,
                restart: () => window.todoApp.restart(),
                info: () => window.todoApp.getAppInfo()
            };
            console.log('🛠️ Debug tools disponíveis em window.debug');
        }
    } else {
        console.error('❌ Falha ao inicializar aplicação');
    }
});