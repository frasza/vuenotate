<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDraggable } from '../composables/useDraggable'
import { useVuenotate } from '../composables/useVuenotate'

const {
  active,
  annotations,
  showMarkers,
  toolbarPosition,
  toggle,
  toggleMarkers,
  clearAnnotations,
  copyOutput,
  setToolbarPosition,
  markerColor,
  clearAfterCopy,
  setMarkerColor,
  setClearAfterCopy,
} = useVuenotate()

const toolbarRef = ref<HTMLElement | null>(null)
const settingsRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const showSettings = ref(false)

const settingsStyle = ref({
  bottom: 'calc(100% + 12px)',
  right: '0',
  top: 'auto',
})

watch(showSettings, async (val) => {
  if (val) {
    await new Promise(resolve => setTimeout(resolve, 0))
    if (!toolbarRef.value || !settingsRef.value) return

    const toolbarRect = toolbarRef.value.getBoundingClientRect()
    const settingsWidth = 200
    const settingsHeight = 150 // Rough estimate, will refine

    const spaceAbove = toolbarRect.top
    const spaceBelow = window.innerHeight - toolbarRect.bottom
    const spaceRight = window.innerWidth - toolbarRect.right
    const spaceLeft = toolbarRect.left

    const newStyle: any = {
      bottom: 'auto',
      top: 'auto',
      left: 'auto',
      right: 'auto',
    }

    if (spaceAbove < settingsHeight && spaceBelow > spaceAbove) {
      newStyle.top = 'calc(100% + 12px)'
    }
    else {
      newStyle.bottom = 'calc(100% + 12px)'
    }

    if (spaceRight < settingsWidth && spaceLeft > spaceRight) {
      newStyle.right = '0'
    }
    else {
      newStyle.left = '0'
    }

    settingsStyle.value = newStyle
  }
})

const colors = [
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Green
  '#eab308', // Yellow
  '#f97316', // Orange
  '#ef4444', // Red
]

const { position } = useDraggable(
  toolbarRef,
  toolbarPosition.value,
  setToolbarPosition,
)

onMounted(() => {
  if (toolbarPosition.value.x === -1 && toolbarPosition.value.y === -1 && toolbarRef.value) {
    const x = window.innerWidth - toolbarRef.value.offsetWidth - 20
    const y = window.innerHeight - toolbarRef.value.offsetHeight - 20
    setToolbarPosition({ x, y })
  }
})

watch(toolbarPosition, (newPos) => {
  position.value = { ...newPos }
}, { immediate: true })

const annotationCount = computed(() => annotations.value.length)

async function handleCopy() {
  const success = await copyOutput()
  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function handleClear() {
  if (annotationCount.value === 0) return
  clearAnnotations()
}
</script>

<template>
  <div
    ref="toolbarRef"
    data-vuenotate
    class="vuenotate-toolbar"
    :class="{ 'is-active': active }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      '--vuenotate-marker-color': markerColor,
    }"
  >
    <div class="toolbar-content">
      <button
        data-drag-handle
        class="toolbar-drag"
        title="Drag to move"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </button>

      <button
        class="toolbar-btn"
        :class="{ 'is-active': active }"
        title="Toggle Vuenotate (Cmd+Shift+V)"
        @click="toggle"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </button>

      <template v-if="active">
        <div class="toolbar-divider" />

        <button
          class="toolbar-btn"
          :class="{ 'is-active': showMarkers }"
          title="Toggle markers"
          @click="toggleMarkers"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="showMarkers" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle v-if="showMarkers" cx="12" cy="12" r="3" />
            <path v-if="!showMarkers" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line v-if="!showMarkers" x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>

        <button
          class="toolbar-btn"
          :disabled="annotationCount === 0"
          :title="copied ? 'Copied!' : 'Copy to clipboard'"
          @click="handleCopy"
        >
          <svg v-if="!copied" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        <button
          class="toolbar-btn"
          :disabled="annotationCount === 0"
          title="Clear all"
          @click="handleClear"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>

        <div class="toolbar-divider" />

        <div class="toolbar-settings-wrapper">
          <button
            class="toolbar-btn"
            :class="{ 'is-active': showSettings }"
            title="Settings"
            @click="showSettings = !showSettings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>

          <div
            v-if="showSettings"
            ref="settingsRef"
            class="settings-panel"
            :style="settingsStyle"
          >
            <div class="settings-group">
              <label>Marker Colour</label>
              <div class="color-grid">
                <button
                  v-for="color in colors"
                  :key="color"
                  class="color-btn"
                  :class="{ 'is-selected': markerColor === color }"
                  :style="{ backgroundColor: color, color: color }"
                  @click="setMarkerColor(color)"
                >
                  <div v-if="markerColor === color" class="color-inner-ring" />
                </button>
              </div>
            </div>

            <div class="settings-divider" />

            <div class="settings-group">
              <label class="checkbox-label">
                <div class="custom-checkbox" :class="{ 'is-checked': clearAfterCopy }">
                  <svg v-if="clearAfterCopy" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <input
                    type="checkbox"
                    :checked="clearAfterCopy"
                    @change="setClearAfterCopy(($event.target as HTMLInputElement).checked)"
                  >
                </div>
                <span>Clear after output</span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="annotationCount > 0" class="toolbar-badge">
          {{ annotationCount }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.vuenotate-toolbar {
  position: fixed;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

.toolbar-content {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toolbar-drag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: grab;
  transition: color 0.15s;
}

.toolbar-drag:hover {
  color: #999;
}

.toolbar-drag:active {
  cursor: grabbing;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
}

.toolbar-btn:hover:not(:disabled) {
  background: #2a2a2a;
  color: #fff;
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.is-active {
  background: var(--vuenotate-marker-color, #3b82f6);
  color: #fff;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: #333;
}

.toolbar-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 4px;
  background: var(--vuenotate-marker-color, #3b82f6);
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
}

.toolbar-settings-wrapper {
  position: relative;
}

.settings-panel {
  position: absolute;
  width: 200px;
  padding: 16px 16px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  color: #fff;
  z-index: 100;
}

.settings-group {
  margin-bottom: 16px;
}

.settings-group:last-child {
  margin-bottom: 0;
}


.settings-group label:not(.checkbox-label) {
  display: block;
  margin-bottom: 12px;
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.settings-divider {
  height: 1px;
  background: #333;
  margin: 16px -16px;
}

.color-grid {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.color-btn {
  position: relative;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.color-btn:hover {
  transform: scale(1.15);
}

.color-inner-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid currentColor;
  border-radius: 50%;
  opacity: 0.8;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
  cursor: pointer;
  white-space: nowrap;
}

.custom-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 5px;
  transition: all 0.2s;
  color: #fff;
}

.custom-checkbox.is-checked {
  background: var(--vuenotate-marker-color, #3b82f6);
  border-color: var(--vuenotate-marker-color, #3b82f6);
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-label span {
  color: #ccc;
  font-size: 13px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
}
</style>


