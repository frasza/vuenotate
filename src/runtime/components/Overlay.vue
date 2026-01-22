<script setup lang="ts">
import { computed } from 'vue'
import { useVuenotate } from '../composables/useVuenotate'
import { getVueComponentInfo } from '../utils/introspect'
import { getElementName } from '../utils/selector'

const { hoveredElement, active, mode, markerColor } = useVuenotate()

const overlayStyle = computed(() => {
  if (!hoveredElement.value) return null

  const rect = hoveredElement.value.getBoundingClientRect()
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderColor: markerColor.value,
    backgroundColor: `${markerColor.value}1a`, // 10% opacity
  }
})

const labelText = computed(() => {
  if (!hoveredElement.value) return ''

  const component = getVueComponentInfo(hoveredElement.value)
  if (component?.name) {
    return component.name
  }

  return getElementName(hoveredElement.value)
})

const isVisible = computed(() => {
  return active.value && mode.value === 'element' && hoveredElement.value
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible && overlayStyle"
      data-vuenotate
      class="vuenotate-overlay"
      :style="overlayStyle"
    >
      <div class="overlay-label" :style="{ backgroundColor: markerColor }">
        {{ labelText }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.vuenotate-overlay {
  position: fixed;
  z-index: 2147483646;
  pointer-events: none;
  background: rgba(59, 130, 246, 0.1);
  border: 2px solid #3b82f6;
  border-radius: 4px;
  transition: all 0.1s ease-out;
}

.overlay-label {
  position: absolute;
  bottom: 100%;
  left: -2px;
  padding: 2px 8px;
  margin-bottom: 4px;
  background: #3b82f6;
  border-radius: 4px;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
