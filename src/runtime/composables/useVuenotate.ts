import type { InjectionKey } from 'vue'
import { inject, provide, reactive, toRefs } from 'vue'
import type { Annotation, PendingAnnotation, Position, SelectionMode, ThemeMode, ToolbarAnchor, VuenotateState } from '../types'
import { copyToClipboard, formatMarkdown } from '../utils/output'

const VUENOTATE_KEY = Symbol('vuenotate') as InjectionKey<any>

interface VuenotateReturn {
  state: VuenotateState
  active: import('vue').Ref<boolean>
  mode: import('vue').Ref<SelectionMode>
  annotations: import('vue').Ref<Annotation[]>
  hoveredElement: import('vue').Ref<HTMLElement | null>
  pendingAnnotation: import('vue').Ref<PendingAnnotation | null>
  showMarkers: import('vue').Ref<boolean>
  toolbarPosition: import('vue').Ref<Position>
  markerColor: import('vue').Ref<string>
  clearAfterCopy: import('vue').Ref<boolean>
  toolbarAnchor: import('vue').Ref<ToolbarAnchor>
  theme: import('vue').Ref<ThemeMode>
  toggle: () => void
  setMode: (mode: SelectionMode) => void
  setHoveredElement: (element: HTMLElement | null) => void
  setPendingAnnotation: (pending: PendingAnnotation | null) => void
  addAnnotation: (note: string) => void
  removeAnnotation: (id: string) => void
  clearAnnotations: () => void
  cancelPending: () => void
  toggleMarkers: () => void
  setToolbarPosition: (position: Position) => void
  setMarkerColor: (color: string) => void
  setClearAfterCopy: (clear: boolean) => void
  setToolbarAnchor: (anchor: ToolbarAnchor) => void
  setTheme: (theme: ThemeMode) => void
  copyOutput: () => Promise<boolean>
  getOutput: () => string
}

export type VuenotateInstance = VuenotateReturn

function createVuenotateState(): VuenotateReturn {
  const state = reactive<VuenotateState>({
    active: false,
    mode: 'idle',
    annotations: [],
    hoveredElement: null,
    pendingAnnotation: null,
    showMarkers: true,
    toolbarPosition: { x: -1, y: -1 },
    toolbarAnchor: 'br',
    markerColor: '#3b82f6',
    clearAfterCopy: false,
    theme: 'dark',
  })

  const stateRefs = toRefs(state)

  function toggle() {
    state.active = !state.active
    if (!state.active) {
      state.mode = 'idle'
      state.hoveredElement = null
      state.pendingAnnotation = null
    }
    else {
      state.mode = 'element'
    }
  }

  function setMode(mode: SelectionMode) {
    state.mode = mode
  }

  function setHoveredElement(element: HTMLElement | null) {
    state.hoveredElement = element
  }

  function setPendingAnnotation(pending: PendingAnnotation | null) {
    state.pendingAnnotation = pending
  }

  function addAnnotation(note: string) {
    if (!state.pendingAnnotation) return

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      type: state.pendingAnnotation.type,
      note,
      selector: state.pendingAnnotation.selector,
      bounds: state.pendingAnnotation.bounds,
      component: state.pendingAnnotation.component,
      selectedText: state.pendingAnnotation.selectedText,
      areaStart: state.pendingAnnotation.areaStart,
      areaEnd: state.pendingAnnotation.areaEnd,
      createdAt: Date.now(),
    }

    state.annotations.push(annotation)
    state.pendingAnnotation = null
  }

  function removeAnnotation(id: string) {
    const index = state.annotations.findIndex((a: Annotation) => a.id === id)
    if (index !== -1) {
      state.annotations.splice(index, 1)
    }
  }

  function clearAnnotations() {
    state.annotations = []
    state.pendingAnnotation = null
  }

  function cancelPending() {
    state.pendingAnnotation = null
  }

  function toggleMarkers() {
    state.showMarkers = !state.showMarkers
  }

  function setToolbarPosition(position: Position) {
    state.toolbarPosition = position
  }

  function setMarkerColor(color: string) {
    state.markerColor = color
  }

  function setClearAfterCopy(clear: boolean) {
    state.clearAfterCopy = clear
  }

  function setToolbarAnchor(anchor: ToolbarAnchor) {
    state.toolbarAnchor = anchor
  }

  function setTheme(theme: ThemeMode) {
    state.theme = theme
  }

  async function copyOutput(): Promise<boolean> {
    const markdown = formatMarkdown(state.annotations)
    const success = await copyToClipboard(markdown)
    if (success && state.clearAfterCopy) {
      clearAnnotations()
    }
    return success
  }

  function getOutput(): string {
    return formatMarkdown(state.annotations)
  }

    return {
    state,
    active: stateRefs.active,
    mode: stateRefs.mode,
    annotations: stateRefs.annotations,
    hoveredElement: stateRefs.hoveredElement,
    pendingAnnotation: stateRefs.pendingAnnotation,
    showMarkers: stateRefs.showMarkers,
    toolbarPosition: stateRefs.toolbarPosition,
    markerColor: stateRefs.markerColor,
    clearAfterCopy: stateRefs.clearAfterCopy,
    toolbarAnchor: stateRefs.toolbarAnchor,
    theme: stateRefs.theme,
    toggle,
    setMode,
    setHoveredElement,
    setPendingAnnotation,
    addAnnotation,
    removeAnnotation,
    clearAnnotations,
    cancelPending,
    toggleMarkers,
    setToolbarPosition,
    setMarkerColor,
    setClearAfterCopy,
    setToolbarAnchor,
    setTheme,
    copyOutput,
    getOutput,
  }
}

export function provideVuenotate(): VuenotateReturn {
  const vuenotate = createVuenotateState()
  provide(VUENOTATE_KEY, vuenotate)
  return vuenotate
}

export function useVuenotate(): VuenotateReturn {
  const vuenotate = inject(VUENOTATE_KEY)
  if (!vuenotate) {
    throw new Error('useVuenotate must be used within a Vuenotate provider')
  }
  return vuenotate
}
