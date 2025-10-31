import type { Canvas, Point, TPointerEvent, TPointerEventInfo } from 'fabric'

interface CanvasCacheOptions {
  /**
   * 缓存队列大小，当缓存的坐标组数量达到此值时，触发刷新。
   *
   * @remarks 越低则刷新越频繁（对带宽和服务器压力增加），越高则在其他玩家眼里的绘制过程看起来会比较“卡顿”
   *
   * @default 5
   */
  cacheSize: number

  /**
   * 强制刷新缓存的触发时间（ms）
   *
   * @remakes 如果一定时间后还未添加新的坐标组，则触发一次强制刷新。
   *
   * @default 50
   */
  flushDelay: number
}

interface CanvasCacheState {
  cachedPoints: CachedPoint[]
  isMouseDown: boolean
  flushTimer: number | null
}

interface CanvasEventHandlerContext extends TPointerEventInfo<TPointerEvent> {
  alreadySelected: boolean
}

type CanvasMouseUpContext = TPointerEventInfo<TPointerEvent>

interface CachedPoint {
  sequence: number
  timestamp?: number
  action: 'down' | 'move' | 'up'
  point: Point
}

export const useCanvasCache = (canvas: Canvas, onFlush?: (cache: CachedPoint[]) => void) => {
  const options = reactive<CanvasCacheOptions>({
    cacheSize: 5,
    flushDelay: 50
  })
  const state = reactive<CanvasCacheState>({
    cachedPoints: [],
    isMouseDown: false,
    flushTimer: null
  })

  const sequenceCounter = ref<number>(0)

  /**
   * 清除缓存计时器
   */
  const clearFlushTimer = () => {
    if (state.flushTimer) {
      window.clearTimeout(state.flushTimer)
      state.flushTimer = null
    }
  }

  /**
   * 清除缓存队列
   */
  const clearCache = () => {
    state.cachedPoints = []
  }

  const addPointToCache = (point: Point, action: CachedPoint['action']) => {
    sequenceCounter.value++

    state.cachedPoints.push({
      sequence: sequenceCounter.value,
      timestamp: Date.now(),
      action,
      point
    })

    // 缓存队列满，立即刷新
    if (state.cachedPoints.length >= options.cacheSize) {
      flushCache()
      return
    }

    // 鼠标不处于按下状态，立即刷新
    if (!state.isMouseDown) {
      scheduleFlush()
    }
  }

  const scheduleFlush = () => {
    clearFlushTimer()

    state.flushTimer = window.setTimeout(() => {
      if (state.cachedPoints.length > 0) {
        flushCache()
      }
    }, options.flushDelay)
  }

  /**
   * 刷新缓存队列
   */
  const flushCache = () => {
    clearFlushTimer()

    if (state.cachedPoints.length === 0) return

    const cacheSnapshot = JSON.parse(JSON.stringify(state.cachedPoints)) as CachedPoint[]

    onFlush?.(cacheSnapshot)

    clearCache()
  }

  // canvas 鼠标事件处理
  const handleMouseDown = (context: CanvasEventHandlerContext) => {
    state.isMouseDown = true
    addPointToCache(context.scenePoint, 'down')
    flushCache() // 鼠标按下时立即刷新缓存队列，以免造成绘画滞后
  }

  const handleMouseMove = (context: CanvasEventHandlerContext) => {
    if (state.isMouseDown) {
      addPointToCache(context.scenePoint, 'move')
    }
  }

  const handleMouseUp = (context: CanvasMouseUpContext) => {
    state.isMouseDown = false

    const mouseUpPoint = canvas.getScenePoint(context.e)
    addPointToCache(mouseUpPoint, 'up')

    flushCache()
    sequenceCounter.value = 0 // 重置队列计数器
  }

  // 注册事件监听器
  canvas.on('mouse:down', handleMouseDown)
  canvas.on('mouse:move', handleMouseMove)
  canvas.on('mouse:up:before', handleMouseUp)

  return {
    options,
    state,
    clearCache,
    clearFlushTimer,
    flushCache
  }
}
