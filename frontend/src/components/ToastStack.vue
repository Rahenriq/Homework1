<script setup>
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notifications';

const notifications = useNotificationStore();
const { toasts } = storeToRefs(notifications);
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <span class="toast__message">{{ toast.message }}</span>
        <button type="button" class="toast__close" aria-label="Dismiss notification" @click="notifications.dismiss(toast.id)">
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
