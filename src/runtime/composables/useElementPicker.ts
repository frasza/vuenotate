import { onMounted, onUnmounted, watch } from 'vue'
import type { Bounds, PendingAnnotation } from '../types'
import { getVueComponentInfo } from '../utils/introspect'
import { getSelector } from '../utils/selector'
import { useVuenotate, type VuenotateInstance } from './useVuenotate'

const IGNORED_SELECTORS = [
  '[data-vuenotate]',
  '[data-vuenotate] *',
]

export function useElementPicker(vuenotate?: VuenotateInstance) {
  const {
    active,
    mode,
    setHoveredElement,
    setPendingAnnotation,
  } = vuenotate ?? useVuenotate()

  function isIgnoredElement(element: HTMLElement): boolean {
    return IGNORED_SELECTORS.some(selector => element.matches(selector))
  }

  function getBounds(element: HTMLElement): Bounds {
    const rect = element.getBoundingClientRect()
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (!active.value || mode.value !== 'element') return

    const target = event.target as HTMLElement
    if (!target || isIgnoredElement(target)) {
      setHoveredElement(null)
      return
    }

    setHoveredElement(target)
  }

  function handleClick(event: MouseEvent) {
    if (!active.value || mode.value !== 'element') return

    const target = event.target as HTMLElement
    if (!target || isIgnoredElement(target)) return

    event.preventDefault()
    event.stopPropagation()

    const pending: PendingAnnotation = {
      type: 'element',
      element: target,
      selector: getSelector(target),
      bounds: getBounds(target),
      component: getVueComponentInfo(target),
    }

    setPendingAnnotation(pending)
    setHoveredElement(null)
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && active.value) {
      setHoveredElement(null)
    }
  }

  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove, true)
    document.removeEventListener('click', handleClick, true)
    document.removeEventListener('keydown', handleKeyDown)
  })

  watch(active, (isActive) => {
    if (!isActive) {
      setHoveredElement(null)
    }
  })
}
