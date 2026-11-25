<script setup>
import PageHeader from '@/components/PageHeader.vue';
</script>

<template>
  <PageHeader title="Page not found" subtitle="The page you were looking for does not exist." />
  <RouterLink to="/" class="btn btn--primary">Go to the dashboard</RouterLink>
</template>
