import { addComponent, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Enable Vuenotate
   * @default true in development, false in production
   */
  enabled?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vuenotate',
    configKey: 'vuenotate',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {},
  setup(options, nuxt) {
    const enabled = options.enabled ?? nuxt.options.dev

    if (!enabled) return

    const { resolve } = createResolver(import.meta.url)

    addComponent({
      name: 'Vuenotate',
      filePath: resolve('./runtime/components/Vuenotate.vue'),
    })

    addPlugin({
      src: resolve('./runtime/plugin.client'),
      mode: 'client',
    })
  },
})
