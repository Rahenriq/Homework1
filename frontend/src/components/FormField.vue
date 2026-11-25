<script setup>
import { computed, useId } from 'vue';

// Labeled input with accessible hint and error text.
const props = defineProps({
  label: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  inputmode: { type: String, default: undefined },
  maxlength: { type: [Number, String], default: undefined },
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
    <input
      :id="id"
      v-model="model"
      class="field__input"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :required="required"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="describedBy"
    />
    <p v-if="hint" :id="hintId" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="field__error">{{ error }}</p>
  </div>
</template>
