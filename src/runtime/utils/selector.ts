/**
 * Generate a unique CSS selector for an element
 * Prefers: id > data-testid > meaningful classes > tag + nth-child
 */
export function getSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${CSS.escape(element.id)}`
  }

  const testId = element.getAttribute('data-testid')
  if (testId) {
    return `[data-testid="${testId}"]`
  }

  const path: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== document.body) {
    const selector = getElementSelector(current)
    path.unshift(selector)

    if (isUnique(path.join(' > '))) {
      break
    }

    current = current.parentElement
  }

  return path.join(' > ')
}

function getElementSelector(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase()

  if (element.id) {
    return `#${CSS.escape(element.id)}`
  }

  const testId = element.getAttribute('data-testid')
  if (testId) {
    return `[data-testid="${testId}"]`
  }

  const meaningfulClasses = getMeaningfulClasses(element)
  if (meaningfulClasses.length > 0) {
    const classSelector = meaningfulClasses.map(c => `.${CSS.escape(c)}`).join('')
    return `${tag}${classSelector}`
  }

  const parent = element.parentElement
  if (parent) {
    const siblings = Array.from(parent.children).filter(
      child => child.tagName === element.tagName
    )
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1
      return `${tag}:nth-of-type(${index})`
    }
  }

  return tag
}

function getMeaningfulClasses(element: HTMLElement): string[] {
  const classes = Array.from(element.classList)

  return classes
    .filter(cls => {
      if (/^[a-z]+-[a-zA-Z0-9]+/.test(cls)) return true
      if (/^(btn|button|card|modal|header|footer|nav|sidebar|menu|form|input|label)/.test(cls)) return true
      if (cls.length > 2 && cls.length < 30 && !/^[a-z]{1,2}$/.test(cls)) return true
      return false
    })
    .slice(0, 2)
}

function isUnique(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1
  }
  catch {
    return false
  }
}

/**
 * Get a human-readable name for an element
 */
export function getElementName(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase()

  if (tag === 'button' || tag === 'a') {
    const text = element.textContent?.trim().slice(0, 30)
    if (text) return `"${text}"`
  }

  if (tag === 'input') {
    const type = element.getAttribute('type') || 'text'
    const name = element.getAttribute('name')
    const placeholder = element.getAttribute('placeholder')
    return name || placeholder || `input[type="${type}"]`
  }

  if (tag === 'img') {
    const alt = element.getAttribute('alt')
    if (alt) return `img "${alt.slice(0, 20)}"`
  }

  const testId = element.getAttribute('data-testid')
  if (testId) return testId

  const classes = getMeaningfulClasses(element)
  if (classes.length > 0) {
    return `.${classes[0]}`
  }

  return tag
}
