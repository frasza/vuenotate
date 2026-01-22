# Vuenotate

Visual feedback tool for Vue/Nuxt applications. Annotate UI elements and generate structured Markdown context for AI coding agents.

## Features

- **Element Picking** - Click any element to annotate it with automatic Vue component detection
- **Text Selection** - Select text to annotate specific content
- **Area Selection** - Alt+drag to annotate screen regions
- **Vue Component Introspection** - Extracts component name, file path, and props from DOM elements
- **Markdown Output** - Generates structured feedback with selectors, component info, and notes
- **Draggable Toolbar** - Floating UI with customizable marker colors
- **Keyboard Shortcut** - Toggle with `Cmd/Ctrl+Shift+V`

## Installation

```bash
# pnpm
pnpm add vuenotate

# npm
npm install vuenotate

# yarn
yarn add vuenotate
```

## Usage

### Nuxt

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['vuenotate']
})
```

The module is enabled by default in development mode. To configure:

```ts
export default defineNuxtConfig({
  modules: ['vuenotate'],
  vuenotate: {
    enabled: true // Force enable/disable
  }
})
```

### Standalone Vue

Import and use the Vue plugin:

```ts
import { createApp } from 'vue'
import { vuenotate } from 'vuenotate/vue'
import App from './App.vue'

createApp(App)
  .use(vuenotate())
  .mount('#app')
```

With options:

```ts
createApp(App)
  .use(vuenotate({ enabled: import.meta.env.DEV }))
  .mount('#app')
```

For manual mounting (custom timing):

```ts
import { mountVuenotate } from 'vuenotate/vue'

// Call after your app is ready
onMounted(() => {
  mountVuenotate()
})
```

## How It Works

1. **Activate** - Press `Cmd/Ctrl+Shift+V` or click the toolbar toggle
2. **Annotate** - Click elements, select text, or Alt+drag areas
3. **Add Notes** - Describe what you want changed in the dialog
4. **Copy** - Click copy button to get Markdown output for your AI agent

### Output Format

```markdown
## VueSpector Feedback

### 1. ProductCard
**Selector**: `[data-testid="product-card"]`
**File**: `components/ProductCard.vue`
**Props**: `{"price":29.99,"title":"Widget"}`
**Note**: Make the price larger and add a discount badge

### 2. Text in Header
**Selector**: `.header-title`
**File**: `components/Header.vue`
**Selected**: "Welcome back"
**Note**: Change this to show the user's name
```

## Toolbar Controls

| Button | Action |
|--------|--------|
| Drag handle | Move toolbar position |
| Toggle (circle+) | Enable/disable annotation mode |
| Eye | Show/hide markers |
| Copy | Copy annotations as Markdown |
| Trash | Clear all annotations |
| Gear | Settings (marker color, clear after copy) |

## Selection Modes

- **Element** - Click any element (default when active)
- **Text** - Select text with mouse
- **Area** - Hold `Alt` and drag to select a region

## Requirements

- Vue 3.4+
- Nuxt 3.0+ (for Nuxt module)

## Development

```bash
# Install dependencies
pnpm install

# Start playground
pnpm dev

# Build module
pnpm build

# Type check
pnpm typecheck
```

## License

MIT
