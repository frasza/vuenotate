export type AnnotationType = 'element' | 'text' | 'area'

export type SelectionMode = 'idle' | 'element' | 'text' | 'area'

export type ThemeMode = 'dark' | 'light'

export type ToolbarAnchor = 'tl' | 'tc' | 'tr' | 'cl' | 'cr' | 'bl' | 'bc' | 'br'

export interface Position {
  x: number
  y: number
}

export interface Bounds {
  top: number
  left: number
  width: number
  height: number
}

export interface VueComponentInfo {
  name: string | null
  file: string | null
  props: Record<string, unknown> | null
}

export interface Annotation {
  id: string
  type: AnnotationType
  note: string
  selector: string
  bounds: Bounds
  component: VueComponentInfo | null
  selectedText?: string
  areaStart?: Position
  areaEnd?: Position
  createdAt: number
}

export interface PendingAnnotation {
  type: AnnotationType
  element: HTMLElement | null
  selector: string
  bounds: Bounds
  component: VueComponentInfo | null
  selectedText?: string
  areaStart?: Position
  areaEnd?: Position
}

export interface VuenotateState {
  active: boolean
  mode: SelectionMode
  annotations: Annotation[]
  hoveredElement: HTMLElement | null
  pendingAnnotation: PendingAnnotation | null
  showMarkers: boolean
  toolbarPosition: Position
  toolbarAnchor: ToolbarAnchor
  markerColor: string
  clearAfterCopy: boolean
  theme: ThemeMode
}
