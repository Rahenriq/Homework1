<script setup>
defineProps({
  courses: { type: Array, required: true },
  busyId: { type: String, default: '' },
});
defineEmits(['delete', 'view-roster']);
</script>

<template>
  <div class="table-wrap">
    <table class="table table--responsive">
      <caption class="visually-hidden">All courses</caption>
      <thead>
        <tr>
          <th scope="col">Course ID</th>
          <th scope="col">Course name</th>
          <th scope="col">Enrolled</th>
          <th scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in courses" :key="course._id">
          <th scope="row" data-label="Course ID"><span class="mono">{{ course.courseId }}</span></th>
          <td data-label="Course name">{{ course.name }}</td>
          <td data-label="Enrolled"><span class="badge">{{ course.enrollmentCount ?? 0 }}</span></td>
          <td class="table__actions">
            <button
              type="button"
              class="btn btn--small btn--ghost"
              :aria-label="`View students enrolled in ${course.courseId}`"
              @click="$emit('view-roster', course)"
            >
              Roster
            </button>
            <button
              type="button"
              class="btn btn--small btn--danger-ghost"
              :disabled="busyId === course._id"
              :aria-label="`Delete course ${course.courseId}`"
              @click="$emit('delete', course)"
            >
              {{ busyId === course._id ? 'Deleting...' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
