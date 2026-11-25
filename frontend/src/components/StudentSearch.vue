<script setup>
import { ref } from 'vue';
import { useStudentsStore } from '@/stores/students';

const students = useStudentsStore();
const term = ref(students.searchTerm);

function onSubmit() {
  students.search(term.value);
}

function onClear() {
  term.value = '';
  students.clearSearch();
}
</script>

<template>
  <form class="search" role="search" @submit.prevent="onSubmit">
    <label for="student-search" class="field__label">Search by name or student ID</label>
    <div class="search__row">
      <input
        id="student-search"
        v-model="term"
        type="search"
        class="field__input"
        placeholder="e.g. John or 1001"
        autocomplete="off"
        @keydown.esc="onClear"
      />
      <button type="submit" class="btn btn--primary" :disabled="students.searching || !term.trim()">
        {{ students.searching ? 'Searching...' : 'Search' }}
      </button>
      <button v-if="students.searchResults" type="button" class="btn btn--ghost" @click="onClear">Clear</button>
    </div>
  </form>
</template>
