import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useStudentsStore } from './students';
import { useCoursesStore } from './courses';

export const useEnrollmentsStore = defineStore('enrollments', () => {
  // Course roster ("students in course") state
  const selectedCourseId = ref('');
  const roster = ref([]);
  const rosterCourse = ref(null);
  const rosterLoading = ref(false);
  const rosterError = ref('');

  async function loadRoster(courseId) {
    selectedCourseId.value = courseId;
    if (!courseId) {
      clearRoster();
      return;
    }
    rosterLoading.value = true;
    rosterError.value = '';
    try {
      const data = await api.getCourseRoster(courseId);
      if (selectedCourseId.value !== courseId) return; // user picked another course meanwhile
      rosterCourse.value = data.course;
      roster.value = data.students;
    } catch (e) {
      rosterError.value = e.message;
      roster.value = [];
      rosterCourse.value = null;
    } finally {
      rosterLoading.value = false;
    }
  }

  function refreshRoster() {
    if (selectedCourseId.value) loadRoster(selectedCourseId.value);
  }

  function clearRoster() {
    selectedCourseId.value = '';
    roster.value = [];
    rosterCourse.value = null;
    rosterError.value = '';
  }

  async function enroll(studentId, courseId) {
    const { message } = await api.enroll(studentId, courseId);
    useStudentsStore().adjustEnrollmentCount(studentId, +1);
    useCoursesStore().adjustEnrollmentCount(courseId, +1);
    if (selectedCourseId.value === courseId) refreshRoster();
    return message;
  }

  async function unenroll(enrollmentId) {
    const { message, enrollment } = await api.unenroll(enrollmentId);
    roster.value = roster.value.filter((s) => s.enrollmentId !== enrollmentId);
    useStudentsStore().adjustEnrollmentCount(enrollment.student, -1);
    useCoursesStore().adjustEnrollmentCount(enrollment.course, -1);
    return message;
  }

  return {
    selectedCourseId,
    roster,
    rosterCourse,
    rosterLoading,
    rosterError,
    loadRoster,
    refreshRoster,
    clearRoster,
    enroll,
    unenroll,
  };
});
