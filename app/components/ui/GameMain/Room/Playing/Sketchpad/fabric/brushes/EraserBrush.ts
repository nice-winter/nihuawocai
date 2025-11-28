import { BaseBrush, Path, Shadow } from 'fabric'
import type { TSimplePathData, ModifierKey, TEvent, Point, Canvas } from 'fabric'
import { getSmoothPathFromPoints, joinPath } from 'fabric/util'

function isEmptySVGPath(pathData: TSimplePathData): boolean {
  return joinPath(pathData) === 'M 0 0 Q 0 0 0 0 L 0 0'
}

type SimpleModifierObject = {
  shiftKey?: boolean
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
}
type EventArg = Partial<TEvent> | PointerEvent | MouseEvent | TouchEvent | SimpleModifierObject
type ExtractedEvent = PointerEvent | MouseEvent | TouchEvent | SimpleModifierObject | undefined

export interface PencilBrushOptions {
  color?: string
  width?: number
}

/**
 * 简单橡皮擦（Eraser）实现，直接复制的 PencilBrush 改造得来
 *
 * @TODO 应该参考官方的 Eraser 实现，但是官方的实现更为复杂，目前暂时没能力做
 * @see https://fabric5.fabricjs.com/erasing
 * @see https://github.com/fabricjs/fabric.js/blob/master/src/mixins/eraser_brush.mixin.ts
 */
export class EraserBrush extends BaseBrush {
  decimate: number = 0.4
  drawStraightLine: boolean = false
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
    this.color = options?.color ?? '#ffffff' // 橡皮擦预览路径颜色，默认为纯白色
    this.width = options?.width ?? 0
  }

  override needsFullRender() {
    return super.needsFullRender() || this._hasStraightLine
  }

  static drawSegment(ctx: CanvasRenderingContext2D, p1: Point, p2: Point) {
    const midPoint = p1.midPointFrom(p2)
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
    return midPoint
  }

  private _extractEvent(evtArg?: EventArg): ExtractedEvent {
    if (!evtArg) return undefined

    if (typeof evtArg === 'object' && 'e' in evtArg && (evtArg as Partial<TEvent>).e) {
      const maybeE = (evtArg as Partial<TEvent>).e

      if (
        maybeE instanceof PointerEvent ||
        maybeE instanceof MouseEvent ||
        maybeE instanceof TouchEvent
      ) {
        return maybeE
      }

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

    if (
      evtArg instanceof PointerEvent ||
      evtArg instanceof MouseEvent ||
      evtArg instanceof TouchEvent
    ) {
      return evtArg
    }

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

  onMouseDown(pointer: Point, evtArg?: EventArg): void {
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

    this._prepareForDrawing(pointer)
    this._addPoint(pointer)
    this._render()
  }

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
        this.oldEnd = EraserBrush.drawSegment(ctx, points[length - 2]!, points[length - 1]!)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  onMouseUp(evtArg?: EventArg): boolean {
    const e = this._extractEvent(evtArg)

    if (e instanceof PointerEvent || e instanceof MouseEvent || e instanceof TouchEvent) {
      if (!this.canvas._isMainEvent(e)) {
        return true
      }
    }

    this.drawStraightLine = false
    this.oldEnd = undefined
    this._finalizeAndAddPath()

    return false
  }

  _prepareForDrawing(pointer: Point) {
    this._reset()
    this._addPoint(pointer)
    this.canvas.contextTop.moveTo(pointer.x, pointer.y)
  }

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

  _reset() {
    this._points = []
    this._setBrushStyles(this.canvas.contextTop)
    this._setShadow()
    this._hasStraightLine = false
  }

  _render(ctx: CanvasRenderingContext2D = this.canvas.contextTop) {
    this._saveAndTransform(ctx)
    ctx.strokeStyle = this.color // 设置笔刷预览颜色
    ctx.lineWidth = this.width

    let p1 = this._points[0]!,
      p2 = this._points[1]!
    this._saveAndTransform(ctx)
    ctx.beginPath()
    if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
      const width = this.width / 1000
      p1.x -= width
      p2.x += width
    }
    ctx.moveTo(p1.x, p1.y)

    for (let i = 1; i < this._points.length; i++) {
      EraserBrush.drawSegment(ctx, p1, p2)
      p1 = this._points[i]!
      p2 = this._points[i + 1]!
    }
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
    ctx.restore()
  }

  convertPointsToSVGPath(points: Point[]): TSimplePathData {
    const correction = this.width / 1000
    return getSmoothPathFromPoints(points, correction)
  }

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
    newPoints.push(points[l]!)
    return newPoints
  }

  _finalizeAndAddPath() {
    const ctx = this.canvas.contextTop
    ctx.closePath()
    if (this.decimate) {
      this._points = this.decimatePoints(this._points, this.decimate)
    }
    const pathData = this.convertPointsToSVGPath(this._points)
    if (isEmptySVGPath(pathData)) {
      this.canvas.requestRenderAll()
      return
    }

    const path = this.createPath(pathData)

    path.set({
      stroke: 'black',
      fill: 'transparent',
      // 将这个对象的混合模式设置为擦除
      globalCompositeOperation: 'destination-out'
    })

    path.shadow = null

    this.canvas.clearContext(this.canvas.contextTop)
    this.canvas.fire('before:path:created', { path: path })
    this.canvas.add(path)
    this.canvas.requestRenderAll()
    path.setCoords()
    this._resetShadow()
    this.canvas.fire('path:created', { path: path })
  }
}
