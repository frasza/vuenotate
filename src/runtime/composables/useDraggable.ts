import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import type { Position } from '../types'

export function useDraggable(
  elementRef: Ref<HTMLElement | null>,
  initialPosition: Position,
  onPositionChange?: (position: Position) => void,
  onDragEnd?: () => void,
) {
  const position = ref<Position>({ ...initialPosition })
  const isDragging = ref(false)
  const dragOffset = ref<Position>({ x: 0, y: 0 })

  function clampToViewport(pos: Position): Position {
    const el = elementRef.value
    if (!el) return pos

    const maxX = window.innerWidth - el.offsetWidth
    const maxY = window.innerHeight - el.offsetHeight

    return {
      x: Math.max(0, Math.min(pos.x, maxX)),
      y: Math.max(0, Math.min(pos.y, maxY)),
    }
  }

  function handleResize() {
    const clamped = clampToViewport(position.value)
    if (clamped.x !== position.value.x || clamped.y !== position.value.y) {
      position.value = clamped
      onPositionChange?.(clamped)
    }
  }

  function handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('[data-drag-handle]')) return

    event.preventDefault()
    isDragging.value = true
    dragOffset.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y,
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging.value) return

    const newX = event.clientX - dragOffset.value.x
    const newY = event.clientY - dragOffset.value.y

    position.value = clampToViewport({ x: newX, y: newY })
    onPositionChange?.(position.value)
  }

  function handleMouseUp() {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    onDragEnd?.()
  }

  onMounted(() => {
    elementRef.value?.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    elementRef.value?.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('resize', handleResize)
  })

  return {
    position,
    isDragging,
    clampToViewport: handleResize,
  }
}
