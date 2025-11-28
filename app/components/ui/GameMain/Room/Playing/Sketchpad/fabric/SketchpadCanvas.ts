import { Canvas, Point, type Path, type TPointerEvent, type TPointerEventInfo } from 'fabric'
import { InputBatcher, type CachedPoint } from './InputBatcher'

export interface SketchpadCanvasOptions
  extends NonNullable<ConstructorParameters<typeof Canvas>[1]> {
  batchOptions?: {
    cacheSize?: number
    flushDelay?: number
  }
}

export class SketchpadCanvas extends Canvas {
  private inputBatcher: InputBatcher
  private isInternalDrawing = false // 内部标记，用于区分是用户画的还是程序画的

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
    // this.on('mouse:out', this._mo)

    // --- 历史记录采集 (用于 Undo/Redo) ---
    this.on('path:created', (e: { path: Path }) => {
      console.log('对象已创建，添加到历史栈:', e.path)
      // this.historyManager.push(e.path)
    })
  }

  // --- 事件处理函数 ---

  private _md = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!this.isDrawingMode) return
    this.isInternalDrawing = true // 标记开始绘制
    this.inputBatcher.add(opt.scenePoint, 'down')
  }

  private _mm = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!this.isDrawingMode || !this.isInternalDrawing) return
    this.inputBatcher.add(opt.scenePoint, 'move')
  }

  private _mu = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!this.isDrawingMode || !this.isInternalDrawing) return

    const point = opt.scenePoint
    this.inputBatcher.add(point, 'up')

    this.inputBatcher.resetSequence() // 重置序列
    this.isInternalDrawing = false // 标记结束
  }

  // private _mo = () => {
  //   // 如果鼠标移出画布，且当前正在绘制，强制结束当前笔画
  //   if (this.isInternalDrawing) {
  //     this.inputBatcher.flush()
  //     this.isInternalDrawing = false
  //   }
  // }

  // --- 外部接口 ---

  /**
   * 当 Batcher 攒够数据吐出来时调用
   */
  private _handleFlush(points: CachedPoint[]) {
    this.fire('cache:flush', points)
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
    this.isInternalDrawing = false
    this.inputBatcher.clear()
  }
}
