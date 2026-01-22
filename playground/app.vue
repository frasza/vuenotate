<script setup lang="ts">
const count = ref(0)
const name = ref('VueSpector')
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>{{ name }} Demo</h1>
      <p class="subtitle">Visual feedback tool for Vue/Nuxt applications</p>
    </header>

    <main class="main">
      <section class="section">
        <h2>Interactive Components</h2>

        <div class="card-grid">
          <DemoCard
            title="Counter"
            description="A simple counter component to test element selection"
          >
            <div class="counter">
              <button class="btn btn-secondary" @click="count--">
                -
              </button>
              <span class="counter-value">{{ count }}</span>
              <button class="btn btn-primary" @click="count++">
                +
              </button>
            </div>
          </DemoCard>

          <DemoCard
            title="Input Field"
            description="Test text selection on input elements"
          >
            <input
              v-model="name"
              type="text"
              class="input"
              placeholder="Enter your name"
            >
          </DemoCard>

          <DemoCard
            title="Buttons"
            description="Various button styles to annotate"
          >
            <div class="button-group">
              <button class="btn btn-primary">Primary</button>
              <button class="btn btn-secondary">Secondary</button>
              <button class="btn btn-danger">Danger</button>
            </div>
          </DemoCard>
        </div>
      </section>

      <section class="section">
        <h2>Text Content</h2>

        <div class="text-content">
          <p>
            This is a paragraph with some <strong>bold text</strong> and
            <em>italic text</em> that you can select. Try selecting a portion
            of this text to create a text annotation.
          </p>

          <p>
            VueSpector captures Vue component information including the component
            name, file path, and props. This helps AI coding agents locate the
            exact source code you're referring to.
          </p>

          <blockquote class="quote">
            "Point at problems, not code" - The key insight is that agents can
            find and fix code much faster when they know exactly which element
            you're refering to.
          </blockquote>
        </div>
      </section>

      <section class="section">
        <h2>Area Selection</h2>

        <p class="hint">
          Hold <kbd>Alt</kbd> and drag to select an area
        </p>

        <div class="area-demo">
          <div class="area-box">Box 1</div>
          <div class="area-box">Box 2</div>
          <div class="area-box">Box 3</div>
          <div class="area-box">Box 4</div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Press <kbd>Cmd+Shift+V</kbd> to toggle VueSpector</p>
    </footer>
  </div>
</template>

<style>
:root {
  --bg: #0a0a0a;
  --bg-secondary: #141414;
  --border: #262626;
  --text: #fafafa;
  --text-muted: #a1a1aa;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --secondary: #27272a;
  --secondary-hover: #3f3f46;
  --danger: #ef4444;
  --radius: 8px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.header {
  margin-bottom: 48px;
  text-align: center;
}

.header h1 {
  margin-bottom: 8px;
  font-size: 2.5rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.125rem;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.section h2 {
  margin-bottom: 24px;
  font-size: 1.5rem;
}

.card-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.counter {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.counter-value {
  min-width: 48px;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 1rem;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: var(--primary);
  outline: none;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--secondary);
  color: var(--text);
}

.btn-secondary:hover {
  background: var(--secondary-hover);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-content p {
  color: var(--text-muted);
}

.quote {
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-left: 4px solid var(--primary);
  border-radius: 0 var(--radius) var(--radius) 0;
  color: var(--text);
  font-style: italic;
}

.hint {
  margin-bottom: 16px;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.hint kbd {
  padding: 2px 6px;
  background: var(--secondary);
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.8125rem;
}

.area-demo {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, 1fr);
}

.area-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-weight: 500;
}

.footer {
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.875rem;
  text-align: center;
}

.footer kbd {
  padding: 2px 8px;
  background: var(--secondary);
  border-radius: 4px;
}
</style>
