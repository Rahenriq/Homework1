<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import ToastStack from '@/components/ToastStack.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const mainEl = ref(null);
const router = useRouter();

// Move focus to the main content after each navigation (helps screen-reader users).
router.afterEach((to, from) => {
  if (from.matched.length && to.path !== from.path) mainEl.value?.focus({ preventScroll: true });
});
</script>

<template>
  <a href="#main" class="skip-link">Skip to main content</a>
  <AppHeader />
  <main id="main" ref="mainEl" class="container main" tabindex="-1">
    <RouterView />
  </main>
  <footer class="app-footer">
    <div class="container">CIS 3339 &middot; Student Management System</div>
  </footer>
  <ToastStack />
  <ConfirmDialog />
</template>
