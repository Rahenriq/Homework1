<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import EnrollmentForm from '@/components/EnrollmentForm.vue';
import SelectField from '@/components/SelectField.vue';
import StudentTable from '@/components/StudentTable.vue';
import StatusMessage from '@/components/StatusMessage.vue';
import { useStudentsStore } from '@/stores/students';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useConfirmStore } from '@/stores/confirm';
import { useNotificationStore } from '@/stores/notifications';

const students = useStudentsStore();
const courses = useCoursesStore();
const enrollments = useEnrollmentsStore();
const confirm = useConfirmStore();
const notifications = useNotificationStore();
const route = useRoute();
const router = useRouter();
const removingId = ref('');

const loadError = computed(() => students.error || courses.error);

function loadLists() {
  students.fetchStudents();
  courses.fetchCourses();
}

onMounted(loadLists);

const courseOptions = computed(() =>
  courses.sortedCourses.map((c) => ({ value: c._id, label: `${c.name} (${c.courseId})` }))
);

// The selected roster course lives in the URL (?course=...) so it survives a refresh.
const rosterCourseId = computed({
  get: () => (typeof route.query.course === 'string' ? route.query.course : ''),
  set: (value) => router.replace({ query: value ? { course: value } : {} }),
});

watch(rosterCourseId, (id) => enrollments.loadRoster(id), { immediate: true });

const rosterTitle = computed(() =>
  enrollments.rosterCourse
    ? `Students in ${enrollments.rosterCourse.courseId} – ${enrollments.rosterCourse.name}`
    : 'Students in course'
);

async function onUnenroll(student) {
  const course = enrollments.rosterCourse;
  const ok = await confirm.ask({
    title: 'Remove enrollment?',
    message: `Remove ${student.name} from ${course?.courseId}? The student and course themselves are kept.`,
    confirmLabel: 'Remove',
  });
  if (!ok) return;

  removingId.value = student.enrollmentId;
  try {
    await enrollments.unenroll(student.enrollmentId);
    notifications.success(`${student.name} removed from ${course?.courseId}`);
  } catch (e) {
    notifications.error(e.message);
    enrollments.refreshRoster();
  } finally {
    removingId.value = '';
  }
}
</script>

<template>
  <PageHeader title="Enrollments" subtitle="Enroll students in courses and view each course's roster." />

  <StatusMessage v-if="loadError" state="error" :message="loadError" retryable @retry="loadLists" />

  <div class="layout-two">
    <PanelCard title="Enroll a student in a course">
      <StatusMessage
        v-if="(students.loading && !students.loaded) || (courses.loading && !courses.loaded)"
        state="loading"
        message="Loading students and courses..."
      />
      <EnrollmentForm v-else />
    </PanelCard>

    <PanelCard title="View a course roster">
      <SelectField
        v-model="rosterCourseId"
        label="Course"
        placeholder="-- Select course --"
        :options="courseOptions"
        :disabled="courses.loading && !courses.loaded"
        hint="The roster loads as soon as you pick a course."
      />
    </PanelCard>
  </div>

  <PanelCard
    :title="rosterTitle"
    :description="enrollments.rosterCourse ? `${enrollments.roster.length} enrolled` : ''"
  >
    <StatusMessage v-if="!rosterCourseId" state="empty" message="Select a course above to see its enrolled students." />
    <StatusMessage v-else-if="enrollments.rosterLoading" state="loading" message="Loading roster..." />
    <StatusMessage
      v-else-if="enrollments.rosterError"
      state="error"
      :message="enrollments.rosterError"
      retryable
      @retry="enrollments.refreshRoster()"
    />
    <StatusMessage v-else-if="!enrollments.roster.length" state="empty" message="No students are enrolled in this course yet." />
    <StudentTable
      v-else
      :students="enrollments.roster"
      :caption="rosterTitle"
      action-label="Remove"
      action-key="enrollmentId"
      :busy-id="removingId"
      @action="onUnenroll"
    />
  </PanelCard>
</template>
