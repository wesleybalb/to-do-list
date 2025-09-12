function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');

    msg.textContent = message;
    modal.classList.remove('hidden');

    function cleanup(result) {
      modal.classList.add('hidden');
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
      resolve(result);
    }

    function onYes() { cleanup(true); }
    function onNo() { cleanup(false); }

    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
  });
}

function showEditModal(currentValue) {
  return new Promise((resolve) => {
    const modal = document.getElementById("edit-modal");
    const input = document.getElementById("edit-input");
    const saveBtn = document.getElementById("edit-save");
    const cancelBtn = document.getElementById("edit-cancel");

    input.value = currentValue || "";
    modal.classList.remove("hidden");
    input.focus();

    function cleanup(result) {
      modal.classList.add("hidden");
      saveBtn.removeEventListener("click", onSave);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    }

    function onSave() {
      cleanup(input.value);
    }

    function onCancel() {
      cleanup(null); // usuário cancelou
    }

    saveBtn.addEventListener("click", onSave);
    cancelBtn.addEventListener("click", onCancel);

    // permite confirmar com Enter
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        onSave();
      }
    });
  });
}
