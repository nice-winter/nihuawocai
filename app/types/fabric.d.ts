import { fabric } from 'fabric'
import type { CachedPoint } from '@/components/ui/GameMain/Room/Playing/Sketchpad/fabric/SketchpadCanvas'

declare module 'fabric' {
  interface CanvasEvents {
    'cache:flush': CachedPoint[]
    'stream:data': CachedPoint[]
  }
}

export {}
