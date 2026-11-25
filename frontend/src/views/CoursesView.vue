<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import PanelCard from '@/components/PanelCard.vue';
import CourseForm from '@/components/CourseForm.vue';
import CourseTable from '@/components/CourseTable.vue';
import StatusMessage from '@/components/StatusMessage.vue';
import { useCoursesStore } from '@/stores/courses';
import { useConfirmStore } from '@/stores/confirm';
import { useNotificationStore } from '@/stores/notifications';

const courses = useCoursesStore();
const confirm = useConfirmStore();
const notifications = useNotificationStore();
const router = useRouter();
const deletingId = ref('');

onMounted(() => courses.fetchCourses());

const description = computed(() => `${courses.count} course${courses.count === 1 ? '' : 's'}`);

function viewRoster(course) {
  router.push({ name: 'enrollments', query: { course: course._id } });
}

async function onDelete(course) {
  const extra = course.enrollmentCount
    ? ` ${course.enrollmentCount} enrollment${course.enrollmentCount === 1 ? '' : 's'} will also be removed.`
    : '';
  const ok = await confirm.ask({
    title: 'Delete course?',
    message: `Delete ${course.courseId} – ${course.name}?${extra} This cannot be undone.`,
  });
  if (!ok) return;

  deletingId.value = course._id;
  try {
    const result = await courses.deleteCourse(course._id);
    const removed = result.removedEnrollments
      ? ` and ${result.removedEnrollments} enrollment${result.removedEnrollments === 1 ? '' : 's'}`
      : '';
    notifications.success(`Deleted ${course.courseId}${removed}`);
  } catch (e) {
    notifications.error(e.message);
    if (e.status === 404) courses.fetchCourses();
  } finally {
    deletingId.value = '';
  }
}
</script>

<template>
  <PageHeader title="Courses" subtitle="Create courses and manage the course catalog." />

  <PanelCard title="Add a course" description="Both fields are required.">
    <CourseForm />
  </PanelCard>

  <PanelCard title="Course list" :description="courses.loaded ? description : ''">
    <template #actions>
      <button type="button" class="btn btn--small btn--ghost" :disabled="courses.loading" @click="courses.fetchCourses()">
        {{ courses.loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </template>

    <StatusMessage v-if="courses.error" state="error" :message="courses.error" retryable @retry="courses.fetchCourses()" />
    <StatusMessage v-else-if="courses.loading && !courses.loaded" state="loading" message="Loading courses..." />
    <StatusMessage v-else-if="!courses.count" state="empty" message="No courses yet. Use the form above to add one." />
    <CourseTable v-else :courses="courses.sortedCourses" :busy-id="deletingId" @delete="onDelete" @view-roster="viewRoster" />
  </PanelCard>
</template>
