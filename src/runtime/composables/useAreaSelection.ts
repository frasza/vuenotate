import { onMounted, onUnmounted, ref } from 'vue'
import type { Bounds, PendingAnnotation, Position } from '../types'
import { getVueComponentInfo } from '../utils/introspect'
import { useVuenotate } from './useVuenotate'

const IGNORED_SELECTORS = [
  '[data-vuenotate]',
  '[data-vuenotate] *',
]

export function useAreaSelection() {
  const {
    active,
    mode,
    setPendingAnnotation,
    setMode,
  } = useVuenotate()

  const isDragging = ref(false)
  const startPos = ref<Position | null>(null)
  const currentPos = ref<Position | null>(null)

  function isIgnoredElement(element: HTMLElement): boolean {
    return IGNORED_SELECTORS.some(selector => element.matches(selector))
  }

  function handleMouseDown(event: MouseEvent) {
    if (!active.value) return
    if (!event.altKey) return

    const target = event.target as HTMLElement
    if (isIgnoredElement(target)) return

    event.preventDefault()
    isDragging.value = true
    startPos.value = { x: event.clientX, y: event.clientY }
    currentPos.value = { x: event.clientX, y: event.clientY }
    setMode('area')
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value) return
    currentPos.value = { x: event.clientX, y: event.clientY }
  }

  function handleMouseUp(event: MouseEvent) {
    if (!isDragging.value || !startPos.value || !currentPos.value) return

    isDragging.value = false

    const x1 = Math.min(startPos.value.x, currentPos.value.x)
    const y1 = Math.min(startPos.value.y, currentPos.value.y)
    const x2 = Math.max(startPos.value.x, currentPos.value.x)
    const y2 = Math.max(startPos.value.y, currentPos.value.y)

    const width = x2 - x1
    const height = y2 - y1

    if (width < 20 || height < 20) {
      startPos.value = null
      currentPos.value = null
      setMode('element')
      return
    }

    const centerX = x1 + width / 2
    const centerY = y1 + height / 2
    const centerElement = document.elementFromPoint(centerX, centerY) as HTMLElement | null

    const bounds: Bounds = {
      top: y1 + window.scrollY,
      left: x1 + window.scrollX,
      width,
      height,
    }

    const pending: PendingAnnotation = {
      type: 'area',
      element: centerElement,
      selector: centerElement ? `area at (${Math.round(x1)}, ${Math.round(y1)})` : 'area selection',
      bounds,
      component: centerElement ? getVueComponentInfo(centerElement) : null,
      areaStart: { x: x1 + window.scrollX, y: y1 + window.scrollY },
      areaEnd: { x: x2 + window.scrollX, y: y2 + window.scrollY },
    }

    setPendingAnnotation(pending)

    startPos.value = null
    currentPos.value = null
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isDragging.value) {
      isDragging.value = false
      startPos.value = null
      currentPos.value = null
      setMode('element')
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleMouseDown, true)
    document.removeEventListener('mousemove', handleMouseMove, true)
    document.removeEventListener('mouseup', handleMouseUp, true)
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    isDragging,
    startPos,
    currentPos,
  }
}
