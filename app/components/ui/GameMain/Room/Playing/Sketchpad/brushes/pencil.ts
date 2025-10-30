import type { Canvas } from 'fabric'
import { PencilBrush } from 'fabric'

export const pencil = (canvas: Canvas, brushOptions?: { color?: string; width?: number }) => {
  const brush = new PencilBrush(canvas)
  brush.decimate = 1
  brush.strokeLineCap = 'round'
  brush.strokeLineJoin = 'round'

  if (brushOptions) {
    brush.color = brushOptions.color || ''
    brush.width = brushOptions.width || 0
  }

  return brush
}
