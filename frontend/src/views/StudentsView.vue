<script setup>
import { computed, onMounted, ref } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import StudentForm from '@/components/StudentForm.vue';
import StudentSearch from '@/components/StudentSearch.vue';
import StudentTable from '@/components/StudentTable.vue';
import StatusMessage from '@/components/StatusMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useConfirmStore } from '@/stores/confirm';
import { useNotificationStore } from '@/stores/notifications';

const students = useStudentsStore();
const confirm = useConfirmStore();
const notifications = useNotificationStore();
const deletingId = ref('');

onMounted(() => students.fetchStudents());

const isSearching = computed(() => students.searchResults !== null);
const visibleStudents = computed(() => (isSearching.value ? students.searchResults : students.sortedStudents));
const listTitle = computed(() =>
  isSearching.value ? `Search results for "${students.searchTerm}"` : 'All students'
);
const listDescription = computed(() => {
  const n = visibleStudents.value.length;
  return `${n} student${n === 1 ? '' : 's'}`;
});

async function onDelete(student) {
  const extra = student.enrollmentCount
    ? ` Their ${student.enrollmentCount} enrollment${student.enrollmentCount === 1 ? '' : 's'} will also be removed.`
    : '';
  const ok = await confirm.ask({
    title: 'Delete student?',
    message: `Delete ${student.name} (${student.studentId})?${extra} This cannot be undone.`,
  });
  if (!ok) return;

  deletingId.value = student._id;
  try {
    const result = await students.deleteStudent(student._id);
    const removed = result.removedEnrollments
      ? ` and ${result.removedEnrollments} enrollment${result.removedEnrollments === 1 ? '' : 's'}`
      : '';
    notifications.success(`Deleted ${student.name}${removed}`);
  } catch (e) {
    notifications.error(e.message);
    if (e.status === 404) students.fetchStudents();
  } finally {
    deletingId.value = '';
  }
}
</script>

<template>
  <PageHeader title="Students" subtitle="Add new students, look up existing records, and remove students." />

  <div class="layout-two">
    <PanelCard title="Add a student" description="All fields are required.">
      <StudentForm />
    </PanelCard>

    <PanelCard title="Find a student">
      <StudentSearch />
      <StatusMessage v-if="students.searchError" state="error" :message="students.searchError" />
    </PanelCard>
  </div>

  <PanelCard :title="listTitle" :description="students.loaded || isSearching ? listDescription : ''">
    <StatusMessage v-if="students.searching" state="loading" message="Searching..." />
    <StatusMessage
      v-else-if="!isSearching && students.error"
      state="error"
      :message="students.error"
      retryable
      @retry="students.fetchStudents()"
    />
    <StatusMessage v-else-if="!isSearching && students.loading && !students.loaded" state="loading" message="Loading students..." />
    <StatusMessage
      v-else-if="isSearching && !visibleStudents.length"
      state="empty"
      :message="`No student matches “${students.searchTerm}”.`"
    />
    <StatusMessage
      v-else-if="!visibleStudents.length"
      state="empty"
      message="No students yet. Use the form above to add the first one."
    />
    <StudentTable
      v-else
      :students="visibleStudents"
      :caption="listTitle"
      :busy-id="deletingId"
      show-enrollments
      @action="onDelete"
    />
  </PanelCard>
</template>
