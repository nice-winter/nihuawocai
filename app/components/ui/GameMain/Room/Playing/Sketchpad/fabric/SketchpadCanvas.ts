import { Canvas, Point, type TPointerEvent, type TPointerEventInfo } from 'fabric'

export interface CanvasCacheOptions {
  /**
   * 缓存队列大小，当缓存的坐标组数量达到此值时，触发刷新。
   *
   * @default 5
   */
  cacheSize: number
  /**
   * 强制刷新缓存的触发时间（ms）
   *
   * @default 50
   */
  flushDelay: number
}

export interface CachedPoint {
  sequence: number
  timestamp: number
  action: 'down' | 'move' | 'up'
  point: Point
}

export interface CanvasCacheState {
  cachedPoints: CachedPoint[]
  isMouseDown: boolean
  flushTimer: number | null
  sequenceCounter: number
}

export type TCanvasOptions = NonNullable<ConstructorParameters<typeof Canvas>[1]>

export interface SketchpadCanvasOptions extends TCanvasOptions {
  cacheOptions?: Partial<CanvasCacheOptions>
  onFlush?: (cache: CachedPoint[]) => void
}

/**
 * SketchpadCanvas 画板
 * 继承自 fabric.js 的 Canvas 类，添加了 cache feature
 */
export class SketchpadCanvas extends Canvas {
  private cacheOptions: CanvasCacheOptions
  private cacheState: CanvasCacheState

  constructor(el?: string | HTMLCanvasElement, options?: SketchpadCanvasOptions) {
    super(el, options)

    this.cacheOptions = {
      cacheSize: options?.cacheOptions?.cacheSize ?? 5,
      flushDelay: options?.cacheOptions?.flushDelay ?? 50
    }

    this.cacheState = {
      cachedPoints: [],
      isMouseDown: false,
      flushTimer: null,
      sequenceCounter: 0
    }

    this._registerCacheEventHandlers()
  }

  private _registerCacheEventHandlers(): void {
    this.on('mouse:down', (context: TPointerEventInfo<TPointerEvent>) => {
      if (!this.isDrawingMode) return // 非可操作状态，不做任何处理

      this.cacheState.isMouseDown = true
      this._addPointToCache(context.scenePoint, 'down')
      this._flushCache() // 立即推送第一个点
    })

    this.on('mouse:move', (context: TPointerEventInfo<TPointerEvent>) => {
      if (!this.isDrawingMode) return

      if (this.cacheState.isMouseDown) {
        this._addPointToCache(context.scenePoint, 'move')
      }
    })

    this.on('mouse:up:before', (context: TPointerEventInfo<TPointerEvent>) => {
      if (!this.isDrawingMode) return

      this.cacheState.isMouseDown = false
      const mouseUpPoint = this.getScenePoint(context.e)
      this._addPointToCache(mouseUpPoint, 'up')
      this._flushCache()
      this.cacheState.sequenceCounter = 0
    })
  }

  private _clearFlushTimer(): void {
    if (this.cacheState.flushTimer) {
      window.clearTimeout(this.cacheState.flushTimer)
      this.cacheState.flushTimer = null
    }
  }

  private _scheduleFlush(): void {
    this._clearFlushTimer()
    this.cacheState.flushTimer = window.setTimeout(() => {
      if (this.cacheState.cachedPoints.length > 0) {
        this._flushCache()
      }
    }, this.cacheOptions.flushDelay)
  }

  private _addPointToCache(point: Point, action: CachedPoint['action']): void {
    this.cacheState.sequenceCounter++

    this.cacheState.cachedPoints.push({
      sequence: this.cacheState.sequenceCounter,
      timestamp: Date.now(),
      action,
      point
    })

    // 队列满立即刷新
    if (this.cacheState.cachedPoints.length >= this.cacheOptions.cacheSize) {
      this._flushCache()
      return
    }

    // 鼠标未按下时也调度刷新
    if (!this.cacheState.isMouseDown) {
      this._scheduleFlush()
    }
  }

  private _flushCache(): void {
    this._clearFlushTimer()

    if (this.cacheState.cachedPoints.length === 0) return

    const snapshot = this.cacheState.cachedPoints.map((p) => ({
      ...p,
      point: new Point(p.point.x, p.point.y)
    }))

    this.fire('cache:flush', snapshot)

    this._clearCache()
  }

  private _clearCache(): void {
    this.cacheState.cachedPoints = []
  }

  public setCacheOptions(options: Partial<CanvasCacheOptions>): void {
    this.cacheOptions = { ...this.cacheOptions, ...options }
  }

  public forceFlush(): void {
    this._flushCache()
  }

  public clearCache(): void {
    this._clearCache()
  }
}
