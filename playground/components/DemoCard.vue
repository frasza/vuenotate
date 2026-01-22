<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="demo-card">
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-description">{{ description }}</p>
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.demo-card {
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.card-title {
  margin-bottom: 8px;
  font-size: 1.125rem;
}

.card-description {
  margin-bottom: 20px;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
