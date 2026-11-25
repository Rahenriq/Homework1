<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import SelectField from './SelectField.vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useNotificationStore } from '@/stores/notifications';

const students = useStudentsStore();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const notifications = useNotificationStore();

const studentId = ref('');
const courseId = ref('');
const errors = ref({});
const formError = ref('');
const submitting = ref(false);

// Options come from the backend data held in the Pinia stores (never hard-coded).
const studentOptions = computed(() =>
  students.sortedStudents.map((s) => ({ value: s._id, label: `${s.name} (${s.studentId})` }))
);
const courseOptions = computed(() =>
  courses.sortedCourses.map((c) => ({ value: c._id, label: `${c.name} (${c.courseId})` }))
);
const missingData = computed(
  () => students.loaded && courses.loaded && (!students.count || !courses.count)
);

async function onSubmit() {
  formError.value = '';
  errors.value = {};
  if (!studentId.value) errors.value.student = 'Please select a student';
  if (!courseId.value) errors.value.course = 'Please select a course';
  if (Object.keys(errors.value).length) return;

  submitting.value = true;
  try {
    const message = await enrollments.enroll(studentId.value, courseId.value);
    notifications.success(message);
    studentId.value = '';
  } catch (e) {
    if (e.status === 404) {
      // The student or course was deleted elsewhere: reload the lists.
      students.fetchStudents();
      courses.fetchCourses();
    }
    if (e.details && Object.keys(e.details).length) errors.value = e.details;
    else formError.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <p v-if="missingData" class="notice">
      You need at least one student and one course before enrolling.
      <RouterLink v-if="!students.count" to="/students">Add a student</RouterLink>
      <template v-if="!students.count && !courses.count"> &middot; </template>
      <RouterLink v-if="!courses.count" to="/courses">Add a course</RouterLink>
    </p>
    <div class="form__grid form__grid--two">
      <SelectField
        v-model="studentId"
        label="Student"
        placeholder="-- Select student --"
        :options="studentOptions"
        :error="errors.student"
        :disabled="students.loading"
        required
      />
      <SelectField
        v-model="courseId"
        label="Course"
        placeholder="-- Select course --"
        :options="courseOptions"
        :error="errors.course"
        :disabled="courses.loading"
        required
      />
    </div>
    <p v-if="formError" class="form__error" role="alert">{{ formError }}</p>
    <div class="form__actions">
      <button type="submit" class="btn btn--primary" :disabled="submitting || missingData">
        <span v-if="submitting" class="spinner spinner--small" aria-hidden="true"></span>
        {{ submitting ? 'Enrolling...' : 'Enroll student' }}
      </button>
    </div>
  </form>
</template>
