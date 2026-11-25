<script setup>
import { reactive, ref } from 'vue';
import FormField from './FormField.vue';
import { validateCourse } from '@/utils/validators';
import { useCoursesStore } from '@/stores/courses';
import { useNotificationStore } from '@/stores/notifications';

const courses = useCoursesStore();
const notifications = useNotificationStore();

const emptyForm = () => ({ courseId: '', name: '' });
const form = reactive(emptyForm());
const errors = ref({});
const formError = ref('');
const submitting = ref(false);

async function onSubmit() {
  formError.value = '';
  errors.value = validateCourse(form);
  const normalizedId = form.courseId.trim().replace(/\s+/g, ' ').toUpperCase();
  if (!errors.value.courseId && courses.courses.some((c) => c.courseId === normalizedId)) {
    errors.value.courseId = 'A course with this ID already exists';
  }
  if (Object.keys(errors.value).length) return;

  submitting.value = true;
  try {
    const payload = { courseId: form.courseId.trim(), name: form.name.trim() };
    const message = await courses.addCourse(payload);
    notifications.success(`${message}: ${normalizedId}`);
    Object.assign(form, emptyForm());
    errors.value = {};
  } catch (e) {
    if (e.status === 409) errors.value = { courseId: e.message };
    else if (e.details && Object.keys(e.details).length) errors.value = e.details;
    else formError.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <div class="form__grid form__grid--course">
      <FormField
        v-model="form.courseId"
        label="Course ID"
        :error="errors.courseId"
        placeholder="CIS 3339"
        hint="Stored in uppercase, must be unique"
        maxlength="20"
        required
      />
      <FormField
        v-model="form.name"
        label="Course name"
        :error="errors.name"
        placeholder="Enterprise Applications Development"
        maxlength="120"
        required
      />
    </div>
    <p v-if="formError" class="form__error" role="alert">{{ formError }}</p>
    <div class="form__actions">
      <button type="submit" class="btn btn--primary" :disabled="submitting">
        <span v-if="submitting" class="spinner spinner--small" aria-hidden="true"></span>
        {{ submitting ? 'Adding...' : 'Add course' }}
      </button>
    </div>
  </form>
</template>
