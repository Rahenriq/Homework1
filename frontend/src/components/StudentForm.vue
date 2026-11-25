<script setup>
import { reactive, ref } from 'vue';
import FormField from './FormField.vue';
import { validateStudent } from '@/utils/validators';
import { useStudentsStore } from '@/stores/students';
import { useNotificationStore } from '@/stores/notifications';

const students = useStudentsStore();
const notifications = useNotificationStore();

const emptyForm = () => ({ name: '', studentId: '', phone: '', zip: '' });
const form = reactive(emptyForm());
const errors = ref({});
const formError = ref('');
const submitting = ref(false);
const nameField = ref(null);

async function onSubmit() {
  formError.value = '';
  errors.value = validateStudent(form);
  // Quick check against the list we already have; the server is still the final authority.
  if (!errors.value.studentId && students.students.some((s) => s.studentId === form.studentId.trim())) {
    errors.value.studentId = 'A student with this ID already exists';
  }
  if (Object.keys(errors.value).length) return;

  submitting.value = true;
  try {
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    const message = await students.addStudent(payload);
    notifications.success(`${message}: ${payload.name} (${payload.studentId})`);
    Object.assign(form, emptyForm());
    errors.value = {};
    nameField.value?.$el.querySelector('input')?.focus();
  } catch (e) {
    if (e.status === 409) errors.value = { studentId: e.message };
    else if (e.details && Object.keys(e.details).length) errors.value = e.details;
    else formError.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <div class="form__grid">
      <FormField ref="nameField" v-model="form.name" label="Name" :error="errors.name" autocomplete="name" maxlength="100" required />
      <FormField
        v-model="form.studentId"
        label="Student ID"
        :error="errors.studentId"
        inputmode="numeric"
        hint="Digits only, must be unique"
        maxlength="10"
        required
      />
      <FormField
        v-model="form.phone"
        label="Phone"
        type="tel"
        :error="errors.phone"
        placeholder="555-1234"
        autocomplete="tel"
        maxlength="20"
        required
      />
      <FormField
        v-model="form.zip"
        label="ZIP code"
        :error="errors.zip"
        inputmode="numeric"
        placeholder="77001"
        autocomplete="postal-code"
        maxlength="10"
        required
      />
    </div>
    <p v-if="formError" class="form__error" role="alert">{{ formError }}</p>
    <div class="form__actions">
      <button type="submit" class="btn btn--primary" :disabled="submitting">
        <span v-if="submitting" class="spinner spinner--small" aria-hidden="true"></span>
        {{ submitting ? 'Adding...' : 'Add student' }}
      </button>
    </div>
  </form>
</template>
