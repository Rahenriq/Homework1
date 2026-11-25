import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useStudentsStore } from './students';
import { useEnrollmentsStore } from './enrollments';

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  const count = computed(() => courses.value.length);
  const sortedCourses = computed(() => [...courses.value].sort((a, b) => a.courseId.localeCompare(b.courseId)));
  const totalEnrollments = computed(() => courses.value.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0));

  async function fetchCourses() {
    loading.value = true;
    error.value = '';
    try {
      courses.value = await api.getCourses();
      loaded.value = true;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function ensureLoaded() {
    if (!loaded.value && !loading.value) await fetchCourses();
  }

  function refreshIfLoaded() {
    if (loaded.value) fetchCourses();
  }

  async function addCourse(course) {
    const { course: created, message } = await api.addCourse(course);
    courses.value.push(created);
    return message;
  }

  async function deleteCourse(id) {
    const result = await api.deleteCourse(id);
    courses.value = courses.value.filter((c) => c._id !== id);

    const enrollments = useEnrollmentsStore();
    if (enrollments.selectedCourseId === id) enrollments.clearRoster();
    if (result.removedEnrollments > 0) useStudentsStore().refreshIfLoaded();
    return result;
  }

  function adjustEnrollmentCount(id, delta) {
    const c = courses.value.find((item) => item._id === id);
    if (c) c.enrollmentCount = Math.max(0, (c.enrollmentCount || 0) + delta);
  }

  return {
    courses,
    sortedCourses,
    loading,
    loaded,
    error,
    count,
    totalEnrollments,
    fetchCourses,
    ensureLoaded,
    refreshIfLoaded,
    addCourse,
    deleteCourse,
    adjustEnrollmentCount,
  };
});
