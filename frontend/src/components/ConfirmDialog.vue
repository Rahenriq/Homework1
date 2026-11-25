<script setup>
import { nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfirmStore } from '@/stores/confirm';

// Native <dialog> gives us focus trapping, Esc-to-close, and a backdrop for free.
const confirm = useConfirmStore();
const { request } = storeToRefs(confirm);
const dialogEl = ref(null);
const cancelBtn = ref(null);

watch(request, async (value) => {
  await nextTick();
  const dialog = dialogEl.value;
  if (!dialog) return;
  if (value && !dialog.open) {
    dialog.showModal();
    cancelBtn.value?.focus(); // safest default for a destructive action
  } else if (!value && dialog.open) {
    dialog.close();
  }
});

function onClose() {
  // Fired by Esc or dialog.close(); treat as cancel if still pending.
  if (request.value) confirm.answer(false);
}
</script>

<template>
  <dialog ref="dialogEl" class="dialog" aria-labelledby="confirm-title" aria-describedby="confirm-message" @close="onClose">
    <template v-if="request">
      <h2 id="confirm-title" class="dialog__title">{{ request.title }}</h2>
      <p id="confirm-message" class="dialog__message">{{ request.message }}</p>
      <div class="dialog__actions">
        <button ref="cancelBtn" type="button" class="btn btn--ghost" @click="confirm.answer(false)">Cancel</button>
        <button type="button" class="btn btn--danger" @click="confirm.answer(true)">{{ request.confirmLabel }}</button>
      </div>
    </template>
  </dialog>
</template>
