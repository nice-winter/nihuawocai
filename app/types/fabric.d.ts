import { fabric } from 'fabric'
import type { CachedPoint } from '@/components/ui/GameMain/Room/Playing/Sketchpad/fabric/SketchpadCanvas'

declare module 'fabric' {
  interface CanvasEvents {
    'stream:points': CachedPoint[]
  }
}

export {}
