<script setup>
import { computed, useId } from 'vue';

// Labeled <select>; options are { value, label } objects supplied by the parent.
const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  placeholder: { type: String, default: '-- Select --' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
});

const model = defineModel({ type: String, default: '' });
const id = useId();
const hintId = `${id}-hint`;
const errorId = `${id}-error`;
const describedBy = computed(
  () => [props.hint && hintId, props.error && errorId].filter(Boolean).join(' ') || undefined
);
</script>

<template>
  <div class="field" :class="{ 'field--invalid': error }">
    <label :for="id" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>
    <select
      :id="id"
      v-model="model"
      class="field__input field__select"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="describedBy"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <p v-if="hint" :id="hintId" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="field__error">{{ error }}</p>
  </div>
</template>
