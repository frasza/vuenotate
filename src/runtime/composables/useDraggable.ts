import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import type { Position } from '../types'

export function useDraggable(
  elementRef: Ref<HTMLElement | null>,
  initialPosition: Position,
  onPositionChange?: (position: Position) => void,
) {
  const position = ref<Position>({ ...initialPosition })
  const isDragging = ref(false)
  const dragOffset = ref<Position>({ x: 0, y: 0 })

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

    const maxX = window.innerWidth - (elementRef.value?.offsetWidth || 200)
    const maxY = window.innerHeight - (elementRef.value?.offsetHeight || 50)

    position.value = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    }

    onPositionChange?.(position.value)
  }

  function handleMouseUp() {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  onMounted(() => {
    elementRef.value?.addEventListener('mousedown', handleMouseDown)
  })

  onUnmounted(() => {
    elementRef.value?.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    position,
    isDragging,
  }
}
