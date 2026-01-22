import type { Annotation } from '../types'
import { getShortFilePath } from './introspect'

/**
 * Format annotations as markdown for AI agents
 */
export function formatMarkdown(annotations: Annotation[]): string {
  if (annotations.length === 0) {
    return '## VueNotate Feedback\n\nNo annotations.'
  }

  const lines: string[] = ['## VueNotate Feedback', '']

  annotations.forEach((annotation, index) => {
    const num = index + 1

    switch (annotation.type) {
      case 'element':
        lines.push(...formatElementAnnotation(num, annotation))
        break
      case 'text':
        lines.push(...formatTextAnnotation(num, annotation))
        break
      case 'area':
        lines.push(...formatAreaAnnotation(num, annotation))
        break
    }

    lines.push('')
  })

  return lines.join('\n')
}

function formatElementAnnotation(num: number, annotation: Annotation): string[] {
  const lines: string[] = []

  const title = annotation.component?.name
    ? `### ${num}. ${annotation.component.name}`
    : `### ${num}. Element`

  lines.push(title)
  lines.push(`**Selector**: \`${annotation.selector}\``)

  if (annotation.component?.file) {
    const shortPath = getShortFilePath(annotation.component.file)
    lines.push(`**File**: \`${shortPath}\``)
  }

  if (annotation.component?.props && Object.keys(annotation.component.props).length > 0) {
    lines.push(`**Props**: \`${JSON.stringify(annotation.component.props)}\``)
  }

  lines.push(`**Note**: ${annotation.note}`)

  return lines
}

function formatTextAnnotation(num: number, annotation: Annotation): string[] {
  const lines: string[] = []

  const title = annotation.component?.name
    ? `### ${num}. Text in ${annotation.component.name}`
    : `### ${num}. Text Selection`

  lines.push(title)
  lines.push(`**Selector**: \`${annotation.selector}\``)

  if (annotation.component?.file) {
    const shortPath = getShortFilePath(annotation.component.file)
    lines.push(`**File**: \`${shortPath}\``)
  }

  if (annotation.selectedText) {
    lines.push(`**Selected**: "${annotation.selectedText}"`)
  }

  lines.push(`**Note**: ${annotation.note}`)

  return lines
}

function formatAreaAnnotation(num: number, annotation: Annotation): string[] {
  const lines: string[] = []

  lines.push(`### ${num}. Area Selection`)

  if (annotation.areaStart && annotation.areaEnd) {
    const { x: x1, y: y1 } = annotation.areaStart
    const { x: x2, y: y2 } = annotation.areaEnd
    lines.push(`**Bounds**: (${Math.round(x1)}, ${Math.round(y1)}) to (${Math.round(x2)}, ${Math.round(y2)})`)
  }

  if (annotation.component?.name) {
    lines.push(`**Near component**: ${annotation.component.name}`)
  }

  lines.push(`**Note**: ${annotation.note}`)

  return lines
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  }
  catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      return true
    }
    catch {
      return false
    }
    finally {
      document.body.removeChild(textarea)
    }
  }
}
