import {
  layoutNextLine,
  type LayoutCursor,
  type LayoutLine,
  type PreparedTextWithSegments,
} from '../src/layout.ts'

export type CollectedLines = {
  lineCount: number
  height: number
  lines: LayoutLine[]
}

export type CollectedLineSlice = CollectedLines & {
  nextCursor: LayoutCursor | null
}

export function collectLines(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number,
): CollectedLines {
  const lines: LayoutLine[] = []
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  const graphemeCache = new Map<number, string[]>()

  while (true) {
    const line = layoutNextLine(prepared, cursor, maxWidth, graphemeCache)
    if (line === null) break
    lines.push(line)
    cursor = line.end
  }

  return {
    lineCount: lines.length,
    height: lines.length * lineHeight,
    lines,
  }
}

export function collectLineSlice(
  prepared: PreparedTextWithSegments,
  start: LayoutCursor,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): CollectedLineSlice {
  const lines: LayoutLine[] = []
  let cursor: LayoutCursor = start
  const graphemeCache = new Map<number, string[]>()

  while (lines.length < maxLines) {
    const line = layoutNextLine(prepared, cursor, maxWidth, graphemeCache)
    if (line === null) {
      return {
        lineCount: lines.length,
        height: lines.length * lineHeight,
        lines,
        nextCursor: null,
      }
    }

    lines.push(line)
    cursor = line.end
  }

  return {
    lineCount: lines.length,
    height: lines.length * lineHeight,
    lines,
    nextCursor: cursor,
  }
}
