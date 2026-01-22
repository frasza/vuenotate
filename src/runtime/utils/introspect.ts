import type { VueComponentInfo } from '../types'

interface VueInternalInstance {
  type: {
    name?: string
    __name?: string
    __file?: string
  }
  props?: Record<string, unknown>
  parent?: VueInternalInstance
}

/**
 * Extract Vue component info from a DOM element
 * Uses Vue's internal __vueParentComponent property
 */
export function getVueComponentInfo(element: HTMLElement): VueComponentInfo | null {
  const vnode = getVueInstance(element)
  if (!vnode) return null

  const componentType = vnode.type
  const name = componentType.name || componentType.__name || null
  const file = componentType.__file || null

  const props = vnode.props
    ? filterRelevantProps(vnode.props)
    : null

  return { name, file, props }
}

function getVueInstance(element: HTMLElement): VueInternalInstance | null {
  let current: HTMLElement | null = element

  while (current) {
    const instance = (current as unknown as { __vueParentComponent?: VueInternalInstance }).__vueParentComponent

    if (instance?.type) {
      const name = instance.type.name || instance.type.__name
      if (name && !isInternalComponent(name)) {
        return instance
      }
    }

    current = current.parentElement
  }

  return null
}

function isInternalComponent(name: string): boolean {
  const internalPrefixes = [
    'Transition',
    'KeepAlive',
    'Teleport',
    'Suspense',
    'Fragment',
    'RouterView',
    'RouterLink',
    'NuxtPage',
    'NuxtLayout',
    'NuxtLink',
    'ClientOnly',
    'Vuenotate',
  ]

  return internalPrefixes.some(prefix => name.startsWith(prefix))
}

function filterRelevantProps(props: Record<string, unknown>): Record<string, unknown> | null {
  const ignoredKeys = ['class', 'style', 'key', 'ref', 'onVnode', 'onUpdate']

  const filtered = Object.entries(props)
    .filter(([key, value]) => {
      if (ignoredKeys.some(ignored => key.startsWith(ignored))) return false
      if (typeof value === 'function') return false
      if (value === undefined) return false
      return true
    })
    .reduce<Record<string, unknown>>((acc, [key, value]) => {
      acc[key] = serializeValue(value)
      return acc
    }, {})

  return Object.keys(filtered).length > 0 ? filtered : null
}

function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) {
    return value.length > 3 ? `Array(${value.length})` : value.map(serializeValue)
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    return keys.length > 5 ? `Object(${keys.length} keys)` : value
  }
  return String(value)
}

/**
 * Get a short file path (relative-looking)
 */
export function getShortFilePath(fullPath: string | null): string | null {
  if (!fullPath) return null

  const match = fullPath.match(/(?:src|app|components|pages|layouts)\/.*$/)
  return match ? match[0] : fullPath.split('/').slice(-2).join('/')
}
