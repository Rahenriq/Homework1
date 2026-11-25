import { ref } from 'vue';
import { defineStore } from 'pinia';

let nextId = 1;

// App-wide toast messages, shown by <ToastStack> from any view.
export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref([]);

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function notify(message, type = 'success', timeout = 4500) {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    if (toasts.value.length > 3) toasts.value.shift(); // keep the stack short
    if (timeout) setTimeout(() => dismiss(id), timeout);
  }

  return {
    toasts,
    dismiss,
    success: (message) => notify(message, 'success'),
    error: (message) => notify(message, 'error', 7000),
  };
});
