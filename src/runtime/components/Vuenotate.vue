<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { provideVuenotate } from '../composables/useVuenotate'
import { useElementPicker } from '../composables/useElementPicker'
import { useTextSelection } from '../composables/useTextSelection'
import AreaOverlay from './AreaOverlay.vue'
import Marker from './Marker.vue'
import NoteDialog from './NoteDialog.vue'
import Overlay from './Overlay.vue'
import Toolbar from './Toolbar.vue'

const vuenotate = provideVuenotate()

useElementPicker(vuenotate)
useTextSelection(vuenotate)

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'v' && (event.metaKey || event.ctrlKey) && event.shiftKey) {
    event.preventDefault()
    vuenotate.toggle()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Toolbar />
  <Overlay />
  <AreaOverlay />
  <NoteDialog />

  <template v-for="(annotation, index) in vuenotate.annotations.value" :key="annotation.id">
    <Marker :annotation="annotation" :index="index" />
  </template>
</template>
