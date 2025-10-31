import { BaseBrush, Path, Shadow } from 'fabric'
import type { TSimplePathData, ModifierKey, TEvent, Point, Canvas } from 'fabric'
import { getSmoothPathFromPoints, joinPath } from 'fabric/util'

/**
 * @private
 * @param {TSimplePathData} pathData SVG path commands
 * @returns {boolean}
 */
function isEmptySVGPath(pathData: TSimplePathData): boolean {
  return joinPath(pathData) === 'M 0 0 Q 0 0 0 0 L 0 0'
}

/**
 * 类型定义：允许传入的第二个参数形式
 * - Partial<TEvent>（原 fabric 调用习惯，包含 e 字段）
 * - 原生 DOM 事件（PointerEvent | MouseEvent | TouchEvent）
 * - 一个简单的“模拟事件”对象，只含某些修饰键字段（例如 { shiftKey: true }）
 */
type SimpleModifierObject = {
  shiftKey?: boolean
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
}
type EventArg = Partial<TEvent> | PointerEvent | MouseEvent | TouchEvent | SimpleModifierObject

/**
 * 提取出来的事件类型：要么是真正的 DOM 事件，要么是简单的修饰键对象，或 undefined
 */
type ExtractedEvent = PointerEvent | MouseEvent | TouchEvent | SimpleModifierObject | undefined

export interface PencilBrushOptions {
  color?: string
  width?: number
}

export class PencilBrush extends BaseBrush {
  /**
   * Discard points that are less than `decimate` pixel distant from each other
   * @type Number
   * @default 0.4
   */
  decimate: number = 0.4

  /**
   * Draws a straight line between last recorded point to current pointer
   * Used for `shift` functionality
   *
   * @type boolean
   * @default false
   */
  drawStraightLine: boolean = false

  /**
   * The event modifier key that makes the brush draw a straight line.
   * If `null` or 'none' or any other string that is not a modifier key the feature is disabled.
   * @type {ModifierKey | undefined | null}
   */
  straightLineKey: ModifierKey | undefined | null = 'shiftKey'

  declare protected _points: Point[]
  declare protected _hasStraightLine: boolean
  declare protected oldEnd?: Point

  constructor(canvas: Canvas, options?: PencilBrushOptions) {
    super(canvas)
    this._points = []
    this._hasStraightLine = false
    this.strokeLineCap = 'round'
    this.strokeLineJoin = 'round'
    this.color = options?.color || '#000000'
    this.width = options?.width || 0
  }

  override needsFullRender() {
    return super.needsFullRender() || this._hasStraightLine
  }

  static drawSegment(ctx: CanvasRenderingContext2D, p1: Point, p2: Point) {
    const midPoint = p1.midPointFrom(p2)
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
    return midPoint
  }

  /**
   * helper: 从传入的第二个参数中提取真实 event（兼容两种调用方式）
   * 返回值类型为 ExtractedEvent（不会返回 any/unknown）
   */
  private _extractEvent(evtArg?: EventArg): ExtractedEvent {
    if (!evtArg) return undefined

    // 如果传入的是 Partial<TEvent> 并且含 e 字段，则取出 e
    if (typeof evtArg === 'object' && 'e' in evtArg && (evtArg as Partial<TEvent>).e) {
      const maybeE = (evtArg as Partial<TEvent>).e
      // DOM Event 的基类是 Event
      if (
        maybeE instanceof PointerEvent ||
        maybeE instanceof MouseEvent ||
        maybeE instanceof TouchEvent
      ) {
        return maybeE
      }
      // 如果 e 不是标准 DOM 事件，但里面含修饰键字段（非常少见），把它当作 SimpleModifierObject
      const candidate = maybeE as unknown as SimpleModifierObject
      if (
        candidate &&
        (typeof candidate.shiftKey === 'boolean' ||
          typeof candidate.altKey === 'boolean' ||
          typeof candidate.ctrlKey === 'boolean' ||
          typeof candidate.metaKey === 'boolean')
      ) {
        return {
          shiftKey: Boolean(candidate.shiftKey),
          altKey: Boolean(candidate.altKey),
          ctrlKey: Boolean(candidate.ctrlKey),
          metaKey: Boolean(candidate.metaKey)
        }
      }
      return undefined
    }

    // 直接传入 DOM Event 的情况
    if (
      evtArg instanceof PointerEvent ||
      evtArg instanceof MouseEvent ||
      evtArg instanceof TouchEvent
    ) {
      return evtArg
    }

    // 直接传入一个简单的修饰键对象
    if (typeof evtArg === 'object' && evtArg !== null) {
      const candidate = evtArg as SimpleModifierObject
      if (
        typeof candidate.shiftKey === 'boolean' ||
        typeof candidate.altKey === 'boolean' ||
        typeof candidate.ctrlKey === 'boolean' ||
        typeof candidate.metaKey === 'boolean'
      ) {
        return {
          shiftKey: Boolean(candidate.shiftKey),
          altKey: Boolean(candidate.altKey),
          ctrlKey: Boolean(candidate.ctrlKey),
          metaKey: Boolean(candidate.metaKey)
        }
      }
    }

    return undefined
  }

  /**
   * Invoked on mouse down
   * 第二个参数可选：可以不传 event（用于网络回放/程序化调用）
   * @param {Point} pointer
   * @param {EventArg} [evtArg]
   */
  onMouseDown(pointer: Point, evtArg?: EventArg): void {
    const e = this._extractEvent(evtArg)

    // 只有当是 DOM 事件时才走 _isMainEvent 过滤；否则视为程序化调用，允许执行
    if (e instanceof PointerEvent || e instanceof MouseEvent || e instanceof TouchEvent) {
      if (!this.canvas._isMainEvent(e)) {
        return
      }
      // 从真实 DOM 事件读取修饰键
      if (this.straightLineKey) {
        const key = this.straightLineKey as keyof (PointerEvent | MouseEvent | TouchEvent)
        // 这些事件都可能包含 shiftKey/altKey/ctrlKey/metaKey
        this.drawStraightLine = Boolean((e as PointerEvent | MouseEvent | TouchEvent)[key])
      } else {
        this.drawStraightLine = false
      }
    } else if (e) {
      // e 是 SimpleModifierObject（模拟按键对象）
      if (this.straightLineKey) {
        const key = this.straightLineKey as keyof SimpleModifierObject
        this.drawStraightLine = Boolean((e as SimpleModifierObject)[key])
      } else {
        this.drawStraightLine = false
      }
    } else {
      // 无事件：程序化调用（例如来自网络的点）
      this.drawStraightLine = false
    }

    this._prepareForDrawing(pointer)
    // capture coordinates immediately
    this._addPoint(pointer)
    this._render()
  }

  /**
   * Invoked on mouse move
   * 第二个参数可选（同上）
   */
  onMouseMove(pointer: Point, evtArg?: EventArg): void {
    const e = this._extractEvent(evtArg)

    if (e instanceof PointerEvent || e instanceof MouseEvent || e instanceof TouchEvent) {
      if (!this.canvas._isMainEvent(e)) {
        return
      }
      if (this.straightLineKey) {
        const key = this.straightLineKey as keyof (PointerEvent | MouseEvent | TouchEvent)
        this.drawStraightLine = Boolean((e as PointerEvent | MouseEvent | TouchEvent)[key])
      } else {
        this.drawStraightLine = false
      }
    } else if (e) {
      if (this.straightLineKey) {
        const key = this.straightLineKey as keyof SimpleModifierObject
        this.drawStraightLine = Boolean((e as SimpleModifierObject)[key])
      } else {
        this.drawStraightLine = false
      }
    } else {
      this.drawStraightLine = false
    }

    if (this.limitedToCanvasSize === true && this._isOutSideCanvas(pointer)) {
      return
    }
    if (this._addPoint(pointer) && this._points.length > 1) {
      if (this.needsFullRender()) {
        // redraw curve
        // clear top canvas
        this.canvas.clearContext(this.canvas.contextTop)
        this._render()
      } else {
        const points = this._points,
          length = points.length,
          ctx = this.canvas.contextTop
        // draw the curve update
        this._saveAndTransform(ctx)
        if (this.oldEnd) {
          ctx.beginPath()
          ctx.moveTo(this.oldEnd.x, this.oldEnd.y)
        }
        this.oldEnd = PencilBrush.drawSegment(ctx, points[length - 2]!, points[length - 1]!)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  /**
   * Invoked on mouse up
   * 第二个参数可选（同上）
   */
  onMouseUp(evtArg?: EventArg): boolean {
    const e = this._extractEvent(evtArg)

    if (e instanceof PointerEvent || e instanceof MouseEvent || e instanceof TouchEvent) {
      if (!this.canvas._isMainEvent(e)) {
        return true
      }
    }
    // 即使没有真实事件也要 finalize（程序化调用）
    this.drawStraightLine = false
    this.oldEnd = undefined
    this._finalizeAndAddPath()

    return false
  }

  /**
   * @private
   * @param {Point} pointer Actual mouse position related to the canvas.
   */
  _prepareForDrawing(pointer: Point) {
    this._reset()
    this._addPoint(pointer)
    this.canvas.contextTop.moveTo(pointer.x, pointer.y)
  }

  /**
   * @private
   * @param {Point} point Point to be added to points array
   */
  _addPoint(point: Point) {
    if (this._points.length > 1 && point.eq(this._points[this._points.length - 1]!)) {
      return false
    }
    if (this.drawStraightLine && this._points.length > 1) {
      this._hasStraightLine = true
      this._points.pop()
    }
    this._points.push(point)
    return true
  }

  /**
   * Clear points array and set contextTop canvas style.
   * @private
   */
  _reset() {
    this._points = []
    this._setBrushStyles(this.canvas.contextTop)
    this._setShadow()
    this._hasStraightLine = false
  }

  /**
   * Draw a smooth path on the topCanvas using quadraticCurveTo
   * @private
   * @param {CanvasRenderingContext2D} [ctx]
   */
  _render(ctx: CanvasRenderingContext2D = this.canvas.contextTop) {
    let p1 = this._points[0]!,
      p2 = this._points[1]!
    this._saveAndTransform(ctx)
    ctx.beginPath()
    //if we only have 2 points in the path and they are the same
    //it means that the user only clicked the canvas without moving the mouse
    //then we should be drawing a dot. A path isn't drawn between two identical dots
    //that's why we set them apart a bit
    if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
      const width = this.width / 1000
      p1.x -= width
      p2.x += width
    }
    ctx.moveTo(p1.x, p1.y)

    for (let i = 1; i < this._points.length; i++) {
      // we pick the point between pi + 1 & pi + 2 as the
      // end point and p1 as our control point.
      PencilBrush.drawSegment(ctx, p1, p2)
      p1 = this._points[i]!
      p2 = this._points[i + 1]!
    }
    // Draw last line as a straight line while
    // we wait for the next point to be able to calculate
    // the bezier control point
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
    ctx.restore()
  }

  /**
   * Converts points to SVG path
   * @param {Point[]} points Array of points
   * @return {TSimplePathData} SVG path commands
   */
  convertPointsToSVGPath(points: Point[]): TSimplePathData {
    const correction = this.width / 1000
    return getSmoothPathFromPoints(points, correction)
  }

  /**
   * Creates a Path object to add on canvas
   * @param {TSimplePathData} pathData Path data
   * @return {Path} Path to add on canvas
   */
  createPath(pathData: TSimplePathData): Path {
    const path = new Path(pathData, {
      fill: null,
      stroke: this.color,
      strokeWidth: this.width,
      strokeLineCap: this.strokeLineCap,
      strokeMiterLimit: this.strokeMiterLimit,
      strokeLineJoin: this.strokeLineJoin,
      strokeDashArray: this.strokeDashArray
    })
    if (this.shadow) {
      this.shadow.affectStroke = true
      path.shadow = new Shadow(this.shadow)
    }

    return path
  }

  /**
   * Decimate points array with the decimate value
   */
  decimatePoints(points: Point[], distance: number) {
    if (points.length <= 2) {
      return points
    }
    let lastPoint = points[0]!,
      cDistance
    const zoom = this.canvas.getZoom(),
      adjustedDistance = Math.pow(distance / zoom, 2),
      l = points.length - 1,
      newPoints = [lastPoint]
    // TODO investigate why this is not i < l
    for (let i = 1; i < l - 1; i++) {
      cDistance =
        Math.pow(lastPoint!.x - points[i]!.x, 2) + Math.pow(lastPoint!.y - points[i]!.y, 2)
      if (cDistance >= adjustedDistance) {
        lastPoint = points[i]!
        newPoints.push(lastPoint)
      }
    }
    // Add the last point from the original line to the end of the array.
    // This ensures decimate doesn't delete the last point on the line, and ensures the line is > 1 point.
    newPoints.push(points[l]!)
    return newPoints
  }

  /**
   * On mouseup after drawing the path on contextTop canvas
   * we use the points captured to create an new Path object
   * and add it to the canvas.
   */
  _finalizeAndAddPath() {
    const ctx = this.canvas.contextTop
    ctx.closePath()
    if (this.decimate) {
      this._points = this.decimatePoints(this._points, this.decimate)
    }
    const pathData = this.convertPointsToSVGPath(this._points)
    if (isEmptySVGPath(pathData)) {
      // do not create 0 width/height paths, as they are
      // rendered inconsistently across browsers
      // Firefox 4, for example, renders a dot,
      // whereas Chrome 10 renders nothing
      this.canvas.requestRenderAll()
      return
    }

    const path = this.createPath(pathData)
    this.canvas.clearContext(this.canvas.contextTop)
    this.canvas.fire('before:path:created', { path: path })
    this.canvas.add(path)
    this.canvas.requestRenderAll()
    path.setCoords()
    this._resetShadow()

    // fire event 'path' created
    this.canvas.fire('path:created', { path: path })
  }
}
