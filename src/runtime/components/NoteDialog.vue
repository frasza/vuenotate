<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useVuenotate } from '../composables/useVuenotate'
import { getShortFilePath } from '../utils/introspect'

const { pendingAnnotation, addAnnotation, cancelPending } = useVuenotate()

const note = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)

const isVisible = computed(() => pendingAnnotation.value !== null)

const dialogStyle = computed(() => {
  if (!pendingAnnotation.value) return {}

  const { bounds } = pendingAnnotation.value
  const dialogWidth = 320
  const dialogHeight = 200

  let left = bounds.left + bounds.width + 16
  let top = bounds.top

  if (left + dialogWidth > window.innerWidth) {
    left = bounds.left - dialogWidth - 16
  }

  if (left < 16) {
    left = 16
  }

  if (top + dialogHeight > window.innerHeight) {
    top = window.innerHeight - dialogHeight - 16
  }

  if (top < 16) {
    top = 16
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  }
})

const displayInfo = computed(() => {
  if (!pendingAnnotation.value) return null

  const { type, selector, component, selectedText } = pendingAnnotation.value

  return {
    type,
    selector,
    componentName: component?.name,
    filePath: component?.file ? getShortFilePath(component.file) : null,
    selectedText: selectedText?.slice(0, 100),
  }
})

watch(isVisible, async (visible) => {
  if (visible) {
    note.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

function handleSubmit() {
  const trimmed = note.value.trim()
  if (!trimmed) return

  addAnnotation(trimmed)
  note.value = ''
}

function handleCancel() {
  note.value = ''
  cancelPending()
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    handleSubmit()
  }
  else if (event.key === 'Escape') {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      data-vuenotate
      class="vuenotate-dialog"
      :style="dialogStyle"
      @keydown="handleKeyDown"
    >
      <div class="dialog-header">
        <span v-if="displayInfo?.type === 'element'" class="dialog-type">Element</span>
        <span v-else-if="displayInfo?.type === 'text'" class="dialog-type dialog-type--text">Text</span>
        <span v-else-if="displayInfo?.type === 'area'" class="dialog-type dialog-type--area">Area</span>

        <button class="dialog-close" title="Cancel (Esc)" @click="handleCancel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div v-if="displayInfo" class="dialog-info">
        <div v-if="displayInfo.componentName" class="info-row">
          <span class="info-label">Component:</span>
          <code class="info-value">{{ displayInfo.componentName }}</code>
        </div>
        <div v-if="displayInfo.filePath" class="info-row">
          <span class="info-label">File:</span>
          <code class="info-value info-value--file">{{ displayInfo.filePath }}</code>
        </div>
        <div v-if="displayInfo.selectedText" class="info-row">
          <span class="info-label">Selected:</span>
          <code class="info-value">"{{ displayInfo.selectedText }}"</code>
        </div>
        <div class="info-row">
          <span class="info-label">Selector:</span>
          <code class="info-value">{{ displayInfo.selector }}</code>
        </div>
      </div>

      <div class="dialog-content">
        <textarea
          ref="inputRef"
          v-model="note"
          class="dialog-input"
          placeholder="What's the issue or change needed?"
          rows="3"
        />
      </div>

      <div class="dialog-footer">
        <button class="dialog-btn dialog-btn--cancel" @click="handleCancel">
          Cancel
        </button>
        <button
          class="dialog-btn dialog-btn--add"
          :disabled="!note.trim()"
          @click="handleSubmit"
        >
          Add
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.vuenotate-dialog {
  position: fixed;
  z-index: 2147483647;
  width: 320px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.dialog-type {
  padding: 2px 8px;
  background: #3b82f6;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dialog-type--text {
  background: #8b5cf6;
}

.dialog-type--area {
  background: #10b981;
}

.dialog-close {
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
  cursor: pointer;
  transition: all 0.15s;
}

.dialog-close:hover {
  background: #2a2a2a;
  color: #fff;
}

.dialog-info {
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.info-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  flex-shrink: 0;
  color: #666;
}

.info-value {
  overflow: hidden;
  padding: 1px 4px;
  background: #2a2a2a;
  border-radius: 3px;
  color: #ddd;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-value--file {
  color: #10b981;
}

.dialog-content {
  padding: 16px;
}

.dialog-input {
  width: 100%;
  padding: 10px 12px;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.15s;
}

.dialog-input:focus {
  border-color: #3b82f6;
  outline: none;
}

.dialog-input::placeholder {
  color: #555;
}

.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #333;
}

.dialog-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.dialog-btn--cancel {
  background: #2a2a2a;
  color: #999;
}

.dialog-btn--cancel:hover {
  background: #333;
  color: #fff;
}

.dialog-btn--add {
  background: #3b82f6;
  color: #fff;
}

.dialog-btn--add:hover:not(:disabled) {
  background: #2563eb;
}

.dialog-btn--add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
