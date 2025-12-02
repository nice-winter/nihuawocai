import { Canvas, type Path, type TPointerEvent, type TPointerEventInfo } from 'fabric'
import { InputBatcher, type CachedPoint } from './InputBatcher'

export interface SketchpadCanvasOptions extends NonNullable<
  ConstructorParameters<typeof Canvas>[1]
> {
  batchOptions?: {
    cacheSize?: number
    flushDelay?: number
  }
}

export class SketchpadCanvas extends Canvas {
  private inputBatcher: InputBatcher
  private isInternalDrawing = false // 内部标记，用于区分是用户画的还是程序画的
  private undoStack: Path[] = []
  private redoStack: Path[] = []

  private lastMouseEvent: TPointerEventInfo<TPointerEvent> | null = null

  constructor(el: string | HTMLCanvasElement, options?: SketchpadCanvasOptions) {
    super(el, options)

    // 1. 初始化输入批处理器
    this.inputBatcher = new InputBatcher({
      cacheSize: options?.batchOptions?.cacheSize ?? 5,
      flushDelay: options?.batchOptions?.flushDelay ?? 50,
      onFlush: (points) => this._handleFlush(points)
    })

    // 2. 注册事件监听
    this._initEventListeners()
  }

  private _initEventListeners() {
    // --- 实时数据采集 (用于直播/网络同步) ---
    this.on('mouse:down', this._md)
    this.on('mouse:move', this._mm)
    this.on('mouse:up', this._mu)

    // --- 历史记录采集 (用于 Undo/Redo) ---
    this.on('path:created', (e: { path: Path }) => {
      this.undoStack.push(e.path) // 添加入撤销路径栈
      this.redoStack.length = 0 // 清空重做路径对象栈，要不然历史记录链会出问题
    })
  }

  // --- 事件处理函数 ---

  private _md = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!this.isDrawingMode) return
    this.lastMouseEvent = opt
    this.isInternalDrawing = true // 标记开始绘制
    this.inputBatcher.add(opt.scenePoint, 'down')
  }

  private _mm = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!this.isDrawingMode || !this.isInternalDrawing) return
    this.lastMouseEvent = opt
    this.inputBatcher.add(opt.scenePoint, 'move')
  }

  private _mu = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!this.isDrawingMode || !this.isInternalDrawing) return
    this.lastMouseEvent = null
    const point = opt.scenePoint
    this.inputBatcher.add(point, 'up')
    this.inputBatcher.resetSequence() // 重置序列
    this.isInternalDrawing = false // 标记结束
  }

  // --- 外部接口 ---

  public undo() {
    if (this.undoStack.length === 0) return

    const path = this.undoStack.pop()
    if (!path) return

    this.redoStack.push(path)
    this.remove(path)
    this.requestRenderAll?.()
  }

  public redo() {
    if (this.redoStack.length === 0) return

    const path = this.redoStack.pop()
    if (!path) return

    this.undoStack.push(path)
    this.add(path)
    this.requestRenderAll?.()
  }

  public clearHistory() {
    this.undoStack.length = 0
    this.redoStack.length = 0
  }

  /**
   * 当 Batcher 攒够数据吐出来时调用
   */
  private _handleFlush(points: CachedPoint[]) {
    this.fire('stream:points', points)
  }

  /**
   * 销毁时清理定时器
   */
  public override dispose() {
    this.inputBatcher.clear()
    return super.dispose()
  }

  /**
   * 重置所有状态
   */
  public reset() {
    if (this.lastMouseEvent) this._onMouseUp(this.lastMouseEvent.e)
    this.isInternalDrawing = false
    this.inputBatcher.clear()
    this.clearHistory()
  }

  public realClear() {
    this._isCurrentlyDrawing = false
    this.clear()
    this.clearHistory()
  }
}
