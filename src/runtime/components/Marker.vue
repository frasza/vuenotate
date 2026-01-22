<script setup lang="ts">
import { computed } from 'vue'
import type { Annotation } from '../types'
import { useVuenotate } from '../composables/useVuenotate'

const props = defineProps<{
  annotation: Annotation
  index: number
}>()

const { removeAnnotation, showMarkers, markerColor } = useVuenotate()

const markerStyle = computed(() => {
  const { bounds } = props.annotation
  return {
    top: `${bounds.top - 12}px`,
    left: `${bounds.left - 12}px`,
    backgroundColor: isArea.value ? undefined : markerColor.value,
  }
})

const isArea = computed(() => props.annotation.type === 'area')

function handleClick(event: MouseEvent) {
  event.stopPropagation()
  removeAnnotation(props.annotation.id)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showMarkers"
      data-vuenotate
      class="vuenotate-marker"
      :class="{ 'is-area': isArea }"
      :style="markerStyle"
      :title="`Click to remove: ${annotation.note.slice(0, 50)}`"
      @click="handleClick"
    >
      {{ index + 1 }}
    </div>
  </Teleport>
</template>

<style scoped>
.vuenotate-marker {
  position: absolute;
  z-index: 2147483645;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #3b82f6;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, background-color 0.15s;
}

.vuenotate-marker:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.vuenotate-marker.is-area {
  background: #10b981;
}

.vuenotate-marker.is-area:hover {
  background: #ef4444;
}
</style>
