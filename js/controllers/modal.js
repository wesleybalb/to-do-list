/* modal.js (robusto: remove todos os listeners e trata Enter/Escape) */

function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');

    msg.textContent = message;
    modal.classList.remove('hidden');

    // handlers nomeados para poder remover depois
    const onYes = () => cleanup(true);
    const onNo = () => cleanup(false);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') cleanup(false);
      if (e.key === 'Enter') cleanup(true);
    };

    function cleanup(result) {
      // esconder modal
      modal.classList.add('hidden');
      // remover listeners
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
      document.removeEventListener('keydown', onKeyDown);
      resolve(result);
    }

    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
    document.addEventListener('keydown', onKeyDown);
  });
}

function showEditModal(currentValue) {
  return new Promise((resolve) => {
    const modal = document.getElementById('edit-modal');
    const input = document.getElementById('edit-input');
    const saveBtn = document.getElementById('edit-save');
    const cancelBtn = document.getElementById('edit-cancel');

    input.value = currentValue || '';
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 60); // garantir foco após animação/paint

    const onSave = () => cleanup(input.value);
    const onCancel = () => cleanup(null);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') cleanup(null);
      if (e.key === 'Enter') cleanup(input.value);
    };

    function cleanup(result) {
      modal.classList.add('hidden');
      saveBtn.removeEventListener('click', onSave);
      cancelBtn.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKeyDown);
      resolve(result);
    }

    saveBtn.addEventListener('click', onSave);
    cancelBtn.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKeyDown);
  });
}

/**
 * Exibe modal para editar detalhes da tarefa
 * @param {Task} task - Tarefa a ser editada
 * @returns {Promise<Object|null>} Objeto com os novos detalhes ou null se cancelado
 */
function showTaskDetailsModal(task) {
    return new Promise((resolve) => {
        // Criar modal dinamicamente
        const modalHTML = `
            <div id="task-details-modal" class="modal-overlay">
                <div class="modal-content task-details-modal-content">
                    <h2>📝 Detalhes da Tarefa</h2>
                    <div class="task-details-form">
                        <div class="form-group">
                            <label for="task-title-display">Título:</label>
                            <div class="task-title-display">${task.description}</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="detailed-description">Descrição Detalhada:</label>
                            <textarea 
                                id="detailed-description" 
                                placeholder="Adicione detalhes sobre esta tarefa..."
                                rows="4"
                            >${task.detailedDescription || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="urgency-level">Nível de Urgência:</label>
                            <select id="urgency-level">
                                <option value="baixa" ${task.urgencyLevel === 'baixa' ? 'selected' : ''}>
                                    🟢 Baixa
                                </option>
                                <option value="normal" ${task.urgencyLevel === 'normal' ? 'selected' : ''}>
                                    🟡 Normal
                                </option>
                                <option value="urgente" ${task.urgencyLevel === 'urgente' ? 'selected' : ''}>
                                    �� Urgente
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button id="save-details" class="btn-primary">💾 Salvar</button>
                        <button id="cancel-details" class="btn-secondary">❌ Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('task-details-modal');
        const detailedDescriptionInput = document.getElementById('detailed-description');
        const urgencyLevelSelect = document.getElementById('urgency-level');
        const saveBtn = document.getElementById('save-details');
        const cancelBtn = document.getElementById('cancel-details');

        // Focar no textarea
        setTimeout(() => detailedDescriptionInput.focus(), 100);

        // Handlers
        const onSave = () => {
            const detailedDescription = detailedDescriptionInput.value.trim();
            const urgencyLevel = urgencyLevelSelect.value;
            cleanup({
                detailedDescription,
                urgencyLevel
            });
        };

        const onCancel = () => cleanup(null);

        const onKeyDown = (e) => {
            if (e.key === 'Escape') cleanup(null);
            if (e.key === 'Enter' && e.ctrlKey) onSave();
        };

        const onClickOutside = (e) => {
            if (e.target === modal) cleanup(null);
        };

        function cleanup(result) {
            modal.classList.add('closing');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 200);
            
            saveBtn.removeEventListener('click', onSave);
            cancelBtn.removeEventListener('click', onCancel);
            document.removeEventListener('keydown', onKeyDown);
            modal.removeEventListener('click', onClickOutside);
            resolve(result);
        }

        // Event listeners
        saveBtn.addEventListener('click', onSave);
        cancelBtn.addEventListener('click', onCancel);
        document.addEventListener('keydown', onKeyDown);
        modal.addEventListener('click', onClickOutside);
    });
}
