import { onMounted, onUnmounted } from 'vue'
import type { Bounds, PendingAnnotation } from '../types'
import { getVueComponentInfo } from '../utils/introspect'
import { getSelector } from '../utils/selector'
import { useVuenotate, type VuenotateInstance } from './useVuenotate'

const IGNORED_SELECTORS = [
  '[data-vuenotate]',
  '[data-vuenotate] *',
]

export function useTextSelection(vuenotate?: VuenotateInstance) {
  const {
    active,
    mode,
    setPendingAnnotation,
    setMode,
  } = vuenotate ?? useVuenotate()

  function isIgnoredElement(element: HTMLElement): boolean {
    return IGNORED_SELECTORS.some(selector => element.matches(selector))
  }

  function handleMouseUp() {
    if (!active.value) return
    if (mode.value !== 'element' && mode.value !== 'text') return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const text = selection.toString().trim()
    if (!text || text.length < 2) return

    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const element = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as HTMLElement

    if (!element || isIgnoredElement(element)) return

    const rect = range.getBoundingClientRect()
    const bounds: Bounds = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    }

    const pending: PendingAnnotation = {
      type: 'text',
      element,
      selector: getSelector(element),
      bounds,
      component: getVueComponentInfo(element),
      selectedText: text.slice(0, 200),
    }

    setPendingAnnotation(pending)
    setMode('text')

    selection.removeAllRanges()
  }

  onMounted(() => {
    document.addEventListener('mouseup', handleMouseUp)
  })

  onUnmounted(() => {
    document.removeEventListener('mouseup', handleMouseUp)
  })
}
