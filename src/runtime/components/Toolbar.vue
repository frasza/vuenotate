<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDraggable } from '../composables/useDraggable'
import { useVuenotate } from '../composables/useVuenotate'
import type { ToolbarAnchor } from '../types'

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
  theme,
  setTheme,
} = useVuenotate()

const PADDING = 20

const anchors: ToolbarAnchor[] = ['tl', 'tc', 'tr', 'cl', 'cr', 'bl', 'bc', 'br']
const toolbarAnchor = ref<ToolbarAnchor>('br')
const toolbarRef = ref<HTMLElement | null>(null)
const settingsRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const showSettings = ref(false)
const annotationCount = computed(() => annotations.value.length)

const settingsStyle = ref({
  bottom: 'calc(100% + 12px)',
  right: '0',
  top: 'auto',
})

const { position } = useDraggable(
  toolbarRef,
  toolbarPosition.value,
  setToolbarPosition,
  () => {
    const nearest = getNearestAnchor(position.value.x, position.value.y)
    if (nearest !== toolbarAnchor.value) {
      toolbarAnchor.value = nearest
    }
    snapToAnchor()
  },
)

let resizeObserver: ResizeObserver | null = null

function getAnchorPosition(anchor: ToolbarAnchor): { x: number, y: number } {
  const el = toolbarRef.value
  if (!el) return { x: 0, y: 0 }

  const w = el.offsetWidth
  const h = el.offsetHeight
  const vw = window.innerWidth
  const vh = window.innerHeight

  const positions: Record<ToolbarAnchor, { x: number, y: number }> = {
    tl: { x: PADDING, y: PADDING },
    tc: { x: (vw - w) / 2, y: PADDING },
    tr: { x: vw - w - PADDING, y: PADDING },
    cl: { x: PADDING, y: (vh - h) / 2 },
    cr: { x: vw - w - PADDING, y: (vh - h) / 2 },
    bl: { x: PADDING, y: vh - h - PADDING },
    bc: { x: (vw - w) / 2, y: vh - h - PADDING },
    br: { x: vw - w - PADDING, y: vh - h - PADDING },
  }

  return positions[anchor]
}

function getNearestAnchor(x: number, y: number): ToolbarAnchor {
  let nearest: ToolbarAnchor = toolbarAnchor.value
  let minDist = Infinity

  for (const anchor of anchors) {
    const pos = getAnchorPosition(anchor)
    const dist = Math.hypot(pos.x - x, pos.y - y)
    if (dist < minDist) {
      minDist = dist
      nearest = anchor
    }
  }

  return nearest
}

function updateSettingsPosition() {
  if (!toolbarRef.value || !settingsRef.value) return

  const toolbarRect = toolbarRef.value.getBoundingClientRect()
  const settingsWidth = 200
  const settingsHeight = 180

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

function snapToAnchor() {
  const pos = getAnchorPosition(toolbarAnchor.value)
  position.value = pos
  setToolbarPosition(pos)
  if (showSettings.value) {
    updateSettingsPosition()
  }
}

function handleResize() {
  snapToAnchor()
  if (showSettings.value) {
    updateSettingsPosition()
  }
}

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

watch(showSettings, async (val) => {
  if (val) {
    await new Promise(resolve => setTimeout(resolve, 0))
    updateSettingsPosition()
  }
})

watch(toolbarPosition, (newPos) => {
  position.value = { ...newPos }
}, { immediate: true })

watch(active, async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
  snapToAnchor()
})

watch(annotationCount, async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
  snapToAnchor()
})

onMounted(() => {
  if (toolbarPosition.value.x === -1 && toolbarPosition.value.y === -1 && toolbarRef.value) {
    snapToAnchor()
  } else {
    snapToAnchor()
  }

  if (toolbarRef.value) {
    resizeObserver = new ResizeObserver(() => {
      snapToAnchor()
    })
    resizeObserver.observe(toolbarRef.value)
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', handleResize)
})

const colors = [
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#eab308',
  '#f97316',
  '#ef4444',
]
</script>

<template>
  <div
    ref="toolbarRef"
    data-vuenotate
    class="vuenotate-toolbar"
    :class="{ 'is-active': active, 'is-dark': theme === 'dark', 'is-light': theme === 'light' }"
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
              <label>Theme</label>
              <div class="theme-toggle">
                <button
                  class="theme-btn"
                  :class="{ 'is-active': theme === 'dark' }"
                  @click="setTheme('dark')"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Dark
                </button>
                <button
                  class="theme-btn"
                  :class="{ 'is-active': theme === 'light' }"
                  @click="setTheme('light')"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Light
                </button>
              </div>
            </div>

            <div class="settings-divider" />

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
  background: var(--vuenotate-bg-primary, #1a1a1a);
  border: 1px solid var(--vuenotate-border-color, #333);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.is-light .toolbar-content {
  --vuenotate-bg-primary: #ffffff;
  --vuenotate-border-color: #e0e0e0;
  --vuenotate-text-primary: #1a1a1a;
  --vuenotate-text-secondary: #666666;
  --vuenotate-bg-hover: #f5f5f5;
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
  color: var(--vuenotate-text-secondary, #666);
  cursor: grab;
  transition: color 0.15s;
}

.toolbar-drag:hover {
  color: var(--vuenotate-text-secondary, #999);
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
  color: var(--vuenotate-text-secondary, #888);
  cursor: pointer;
  transition: all 0.15s;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--vuenotate-bg-hover, #2a2a2a);
  color: var(--vuenotate-text-primary, #fff);
}

.is-light .toolbar-btn:hover:not(:disabled) {
  color: var(--vuenotate-text-primary, #1a1a1a);
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
  background: var(--vuenotate-border-color, #333);
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
  background: var(--vuenotate-bg-primary, #1a1a1a);
  border: 1px solid var(--vuenotate-border-color, #333);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  color: var(--vuenotate-text-primary, #fff);
  z-index: 100;
}

.is-light .settings-panel {
  --vuenotate-bg-primary: #ffffff;
  --vuenotate-border-color: #e0e0e0;
  --vuenotate-text-primary: #1a1a1a;
  --vuenotate-text-secondary: #666666;
  --vuenotate-bg-hover: #f5f5f5;
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
  color: var(--vuenotate-text-secondary, #888);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.settings-divider {
  height: 1px;
  background: var(--vuenotate-border-color, #333);
  margin: 16px -16px;
}

.theme-toggle {
  display: flex;
  gap: 8px;
}

.theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--vuenotate-bg-hover, #2a2a2a);
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--vuenotate-text-secondary, #888);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.is-light .theme-btn {
  background: #f5f5f5;
  color: #666;
}

.theme-btn:hover {
  border-color: var(--vuenotate-marker-color, #3b82f6);
}

.theme-btn.is-active {
  background: var(--vuenotate-marker-color, #3b82f6);
  color: #fff;
  border-color: var(--vuenotate-marker-color, #3b82f6);
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
  background: var(--vuenotate-bg-hover, #2a2a2a);
  border: 1px solid #444;
  border-radius: 5px;
  transition: all 0.2s;
  color: #fff;
}

.is-light .custom-checkbox {
  background: #f5f5f5;
  border-color: #ddd;
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
  color: var(--vuenotate-text-primary, #ccc);
  font-size: 13px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
}

.is-light .checkbox-label span {
  color: var(--vuenotate-text-primary, #333);
}
</style>


