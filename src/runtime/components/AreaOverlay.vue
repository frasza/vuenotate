<script setup lang="ts">
import { computed } from 'vue'
import { useAreaSelection } from '../composables/useAreaSelection'

const { isDragging, startPos, currentPos } = useAreaSelection()

const overlayStyle = computed(() => {
  if (!isDragging.value || !startPos.value || !currentPos.value) return null

  const x1 = Math.min(startPos.value.x, currentPos.value.x)
  const y1 = Math.min(startPos.value.y, currentPos.value.y)
  const x2 = Math.max(startPos.value.x, currentPos.value.x)
  const y2 = Math.max(startPos.value.y, currentPos.value.y)

  return {
    left: `${x1}px`,
    top: `${y1}px`,
    width: `${x2 - x1}px`,
    height: `${y2 - y1}px`,
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isDragging && overlayStyle"
      data-vuenotate
      class="vuenotate-area-overlay"
      :style="overlayStyle"
    />
  </Teleport>
</template>

<style scoped>
.vuenotate-area-overlay {
  position: fixed;
  z-index: 2147483646;
  pointer-events: none;
  background: rgba(16, 185, 129, 0.15);
  border: 2px dashed #10b981;
  border-radius: 4px;
}
</style>
