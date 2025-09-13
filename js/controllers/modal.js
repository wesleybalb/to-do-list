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
