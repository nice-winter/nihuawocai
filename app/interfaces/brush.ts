interface Brush {
  name: BrushesNameString
  icon: string
  widths: number[]
  defaultOptions: {
    color: string
    width: number
  }
}

type BrushesNameString = 'pencil' | 'eraser'

export type { Brush, BrushesNameString }
