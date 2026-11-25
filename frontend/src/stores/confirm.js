import { ref } from 'vue';
import { defineStore } from 'pinia';

// Promise-based confirmation dialog shared by every view:
//   if (await confirm.ask({ title, message })) { ... }
export const useConfirmStore = defineStore('confirm', () => {
  const request = ref(null);
  let resolver = null;

  function ask({ title, message, confirmLabel = 'Delete' }) {
    if (resolver) resolver(false);
    request.value = { title, message, confirmLabel };
    return new Promise((resolve) => {
      resolver = resolve;
    });
  }

  function answer(value) {
    request.value = null;
    if (resolver) resolver(value);
    resolver = null;
  }

  return { request, ask, answer };
});
