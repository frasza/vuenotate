import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/vue', name: 'vue' },
  ],
  externals: ['vue'],
})
