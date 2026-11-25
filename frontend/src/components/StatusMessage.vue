<script setup>
// One component for loading, error, and empty states so they look the same everywhere.
defineProps({
  state: { type: String, required: true, validator: (v) => ['loading', 'error', 'empty'].includes(v) },
  message: { type: String, default: '' },
  retryable: { type: Boolean, default: false },
});
defineEmits(['retry']);
</script>

<template>
  <div
    class="status"
    :class="`status--${state}`"
    :role="state === 'error' ? 'alert' : 'status'"
    :aria-busy="state === 'loading' ? 'true' : undefined"
  >
    <span v-if="state === 'loading'" class="spinner" aria-hidden="true"></span>
    <svg v-else-if="state === 'error'" class="status__icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M12 7v6M12 16.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <svg v-else class="status__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span class="status__text">{{ message || (state === 'loading' ? 'Loading...' : '') }}</span>
    <button v-if="retryable && state === 'error'" type="button" class="btn btn--small btn--ghost" @click="$emit('retry')">
      Try again
    </button>
    <slot />
  </div>
</template>
