<script setup>
// Reused for the student list, search results, and course rosters.
defineProps({
  students: { type: Array, required: true },
  caption: { type: String, required: true },
  actionLabel: { type: String, default: 'Delete' },
  showEnrollments: { type: Boolean, default: false },
  busyId: { type: String, default: '' },
  // Which field identifies the row for the action (e.g. enrollmentId on a roster)
  actionKey: { type: String, default: '_id' },
});
defineEmits(['action']);
</script>

<template>
  <div class="table-wrap">
    <table class="table table--responsive">
      <caption class="visually-hidden">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Student ID</th>
          <th scope="col">Phone</th>
          <th scope="col">ZIP</th>
          <th v-if="showEnrollments" scope="col">Courses</th>
          <th scope="col"><span class="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student[actionKey]">
          <th scope="row" data-label="Name">{{ student.name }}</th>
          <td data-label="Student ID"><span class="mono">{{ student.studentId }}</span></td>
          <td data-label="Phone">{{ student.phone }}</td>
          <td data-label="ZIP">{{ student.zip }}</td>
          <td v-if="showEnrollments" data-label="Courses">
            <span class="badge">{{ student.enrollmentCount ?? 0 }}</span>
          </td>
          <td class="table__actions">
            <button
              type="button"
              class="btn btn--small btn--danger-ghost"
              :disabled="busyId === student[actionKey]"
              :aria-label="`${actionLabel} ${student.name} (${student.studentId})`"
              @click="$emit('action', student)"
            >
              {{ busyId === student[actionKey] ? 'Working...' : actionLabel }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
