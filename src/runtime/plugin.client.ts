import { defineNuxtPlugin } from '#app'
import { mountVuenotate } from './plugin'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    mountVuenotate()
  })
})
