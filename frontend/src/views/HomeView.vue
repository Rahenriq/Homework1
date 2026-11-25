<script setup>
import { computed, onMounted } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import StatusMessage from '@/components/StatusMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';

const students = useStudentsStore();
const courses = useCoursesStore();

const loading = computed(() => students.loading || courses.loading);
const error = computed(() => students.error || courses.error);

function load() {
  students.fetchStudents();
  courses.fetchCourses();
}

onMounted(load);

const cards = computed(() => [
  { to: '/students', label: 'Students', value: students.count, text: 'Add, search, and remove students' },
  { to: '/courses', label: 'Courses', value: courses.count, text: 'Create and manage course offerings' },
  { to: '/enrollments', label: 'Enrollments', value: courses.totalEnrollments, text: 'Enroll students and view rosters' },
]);
</script>

<template>
  <PageHeader title="Dashboard" subtitle="Manage students, courses, and enrollments in one place." />

  <StatusMessage v-if="error" state="error" :message="error" retryable @retry="load" />
  <StatusMessage v-else-if="loading && !students.loaded" state="loading" message="Loading summary..." />

  <ul class="stat-grid" aria-label="Summary">
    <li v-for="card in cards" :key="card.to">
      <RouterLink :to="card.to" class="stat-card">
        <span class="stat-card__value">{{ students.loaded && courses.loaded ? card.value : '–' }}</span>
        <span class="stat-card__label">{{ card.label }}</span>
        <span class="stat-card__text">{{ card.text }}</span>
      </RouterLink>
    </li>
  </ul>
</template>
