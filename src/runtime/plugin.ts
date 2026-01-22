import type { App, Plugin } from 'vue'
import { createApp, h } from 'vue'
import Vuenotate from './components/Vuenotate.vue'

export interface VuenotateOptions {
  /**
   * Enable Vuenotate
   * @default true
   */
  enabled?: boolean
}

let mounted = false

function mount() {
  if (mounted || typeof document === 'undefined') return

  const container = document.createElement('div')
  container.id = 'vuenotate-root'
  document.body.appendChild(container)

  createApp({ render: () => h(Vuenotate) }).mount(container)
  mounted = true
}

/**
 * Mount Vuenotate immediately (for use after app is mounted)
 */
export function mountVuenotate() {
  mount()
}

/**
 * Vue plugin for standalone Vue apps
 */
export function vuenotate(options: VuenotateOptions = {}): Plugin {
  return {
    install(app: App) {
      if (options.enabled === false) return

      const originalMount = app.mount.bind(app)
      app.mount = (rootContainer, isHydrate, namespace) => {
        const result = originalMount(rootContainer, isHydrate, namespace)
        mount()
        return result
      }
    },
  }
}
