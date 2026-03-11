import gatsbyText from './gatsby.txt' with { type: 'text' }
import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '../src/layout.ts'

const FONT = '20px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif'
const LINE_HEIGHT = 32
const FRAME_PADDING = 24
const TEXT_PADDING = 20
const SHAPE_TOP = 32

const FRAME_TEXT = gatsbyText
  .split(/\n\s*\n/u)
  .map(paragraph => paragraph.trim())
  .filter(Boolean)
  .slice(0, 10)
  .join(' ')

const widthInput = document.getElementById('frame-width') as HTMLInputElement
const cutoutInput = document.getElementById('cutout-size') as HTMLInputElement
const statWidth = document.getElementById('stat-width')!
const statLines = document.getElementById('stat-lines')!
const statInset = document.getElementById('stat-inset')!
const statHeight = document.getElementById('stat-height')!
const sheet = document.getElementById('sheet') as HTMLDivElement
const shape = document.getElementById('shape') as HTMLDivElement

const prepared: PreparedTextWithSegments = prepareWithSegments(FRAME_TEXT, FONT)

function circularInset(radius: number, lineTop: number): number {
  const centerY = SHAPE_TOP + radius
  const lineMid = lineTop + LINE_HEIGHT / 2
  const dy = lineMid - centerY
  if (Math.abs(dy) >= radius) return 0
  return Math.sqrt(radius * radius - dy * dy)
}

function render(): void {
  const frameWidth = parseInt(widthInput.value, 10)
  const radius = parseInt(cutoutInput.value, 10)
  const usableWidth = frameWidth - FRAME_PADDING * 2
  const shapeDiameter = radius * 2

  sheet.style.width = `${usableWidth}px`
  shape.style.top = `${SHAPE_TOP}px`
  shape.style.width = `${shapeDiameter}px`
  shape.style.height = `${shapeDiameter}px`

  const lines = Array.from(sheet.querySelectorAll('.line'))
  for (const line of lines) line.remove()

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let lineIndex = 0
  let maxInset = 0

  while (true) {
    const top = lineIndex * LINE_HEIGHT
    const inset = circularInset(radius, top)
    maxInset = Math.max(maxInset, inset)

    const x = TEXT_PADDING + inset
    const width = usableWidth - TEXT_PADDING * 2 - inset
    const line = layoutNextLine(prepared, cursor, width)
    if (line === null) break

    const el = document.createElement('div')
    el.className = 'line'
    el.textContent = line.text
    el.style.top = `${top}px`
    el.style.left = `${x}px`
    el.title =
      `width ${line.width.toFixed(2)}px • ` +
      `${line.start.segmentIndex}:${line.start.graphemeIndex}→${line.end.segmentIndex}:${line.end.graphemeIndex}` +
      (line.trailingDiscretionaryHyphen ? ' • discretionary hyphen' : '')
    sheet.appendChild(el)

    cursor = line.end
    lineIndex++
  }

  sheet.style.minHeight = `${Math.max(760, lineIndex * LINE_HEIGHT + TEXT_PADDING * 2)}px`

  statWidth.textContent = `${frameWidth}px`
  statLines.textContent = String(lineIndex)
  statInset.textContent = `${Math.round(maxInset)}px`
  statHeight.textContent = `${lineIndex * LINE_HEIGHT}px`
}

widthInput.addEventListener('input', render)
cutoutInput.addEventListener('input', render)

render()
