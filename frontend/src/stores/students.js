import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { useCoursesStore } from './courses';
import { useEnrollmentsStore } from './enrollments';

export const useStudentsStore = defineStore('students', () => {
  const students = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  // Search state (kept in the store so it survives navigating away and back).
  const searchTerm = ref('');
  const searchResults = ref(null); // null = no active search
  const searching = ref(false);
  const searchError = ref('');

  const count = computed(() => students.value.length);
  const sortedStudents = computed(() =>
    [...students.value].sort((a, b) => a.name.localeCompare(b.name) || a.studentId.localeCompare(b.studentId))
  );

  async function fetchStudents() {
    loading.value = true;
    error.value = '';
    try {
      students.value = await api.getStudents();
      loaded.value = true;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function ensureLoaded() {
    if (!loaded.value && !loading.value) await fetchStudents();
  }

  async function search(term) {
    searchTerm.value = term.trim();
    if (!searchTerm.value) {
      clearSearch();
      return;
    }
    searching.value = true;
    searchError.value = '';
    try {
      searchResults.value = await api.getStudents(searchTerm.value);
    } catch (e) {
      searchError.value = e.message;
      searchResults.value = null;
    } finally {
      searching.value = false;
    }
  }

  function clearSearch() {
    searchTerm.value = '';
    searchResults.value = null;
    searchError.value = '';
  }

  // Throws ApiError so the form can show field-level messages.
  async function addStudent(student) {
    const { student: created, message } = await api.addStudent(student);
    students.value.push(created);
    return message;
  }

  async function deleteStudent(id) {
    const result = await api.deleteStudent(id);
    students.value = students.value.filter((s) => s._id !== id);
    if (searchResults.value) searchResults.value = searchResults.value.filter((s) => s._id !== id);

    // The student's enrollments were removed on the server, so related state is stale.
    if (result.removedEnrollments > 0) {
      useCoursesStore().refreshIfLoaded();
      useEnrollmentsStore().refreshRoster();
    }
    return result;
  }

  // Called when enrollments change so the per-student counts stay accurate.
  function adjustEnrollmentCount(id, delta) {
    for (const list of [students.value, searchResults.value || []]) {
      const s = list.find((item) => item._id === id);
      if (s) s.enrollmentCount = Math.max(0, (s.enrollmentCount || 0) + delta);
    }
  }

  function refreshIfLoaded() {
    if (loaded.value) fetchStudents();
    if (searchResults.value && searchTerm.value) search(searchTerm.value);
  }

  return {
    students,
    sortedStudents,
    loading,
    loaded,
    error,
    count,
    searchTerm,
    searchResults,
    searching,
    searchError,
    fetchStudents,
    ensureLoaded,
    search,
    clearSearch,
    addStudent,
    deleteStudent,
    adjustEnrollmentCount,
    refreshIfLoaded,
  };
});
