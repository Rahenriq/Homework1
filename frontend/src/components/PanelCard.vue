<script setup>
import { useId } from 'vue';

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
});

const headingId = useId();
</script>

<template>
  <section class="panel" :aria-labelledby="headingId">
    <header class="panel__header">
      <div>
        <h2 :id="headingId" class="panel__title">{{ title }}</h2>
        <p v-if="description" class="panel__description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="panel__actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>
