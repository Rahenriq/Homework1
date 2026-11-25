<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/courses', label: 'Courses' },
  { to: '/enrollments', label: 'Enrollments' },
];

const menuOpen = ref(false);
const route = useRoute();

// Close the mobile menu after navigating.
watch(() => route.fullPath, () => {
  menuOpen.value = false;
});
</script>

<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <RouterLink to="/" class="brand">
        <svg class="brand__icon" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="7" fill="currentColor" />
          <path d="M16 7 4 13l12 6 12-6-12-6Zm-7 9.2v5.3c0 1.9 3.1 3.5 7 3.5s7-1.6 7-3.5v-5.3l-7 3.5-7-3.5Z" fill="#f2b84b" />
        </svg>
        <span>Student Management</span>
      </RouterLink>

      <button
        type="button"
        class="nav-toggle"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="visually-hidden">{{ menuOpen ? 'Close' : 'Open' }} navigation menu</span>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path v-if="!menuOpen" d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path v-else d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>

      <nav id="main-nav" class="main-nav" :class="{ 'is-open': menuOpen }" aria-label="Main">
        <ul>
          <li v-for="link in links" :key="link.to">
            <RouterLink :to="link.to" class="main-nav__link" exact-active-class="is-active">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
