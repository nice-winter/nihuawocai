import type { Point } from 'fabric'

export interface CachedPoint {
  sequence: number
  timestamp: number
  action: 'down' | 'move' | 'up'
  point: { x: number; y: number }
}

export interface BatcherOptions {
  cacheSize: number
  flushDelay: number
  onFlush: (points: CachedPoint[]) => void
}

export class InputBatcher {
  private queue: CachedPoint[] = []
  private timer: number | null = null
  private options: BatcherOptions
  private sequenceCounter = 0

  constructor(options: BatcherOptions) {
    this.options = options
  }

  /**
   * 添加点到队列
   * @param point Fabric Point 对象
   * @param action 动作类型
   */
  public add(point: Point, action: CachedPoint['action']) {
    this.sequenceCounter++

    // 将 Point 转换为普通对象，断开引用，防止后续突变
    const safePoint = { x: point.x, y: point.y }

    this.queue.push({
      sequence: this.sequenceCounter,
      timestamp: Date.now(),
      action,
      point: safePoint
    })

    // 策略1：缓冲区满立即发送
    if (this.queue.length >= this.options.cacheSize) {
      this.flush()
    }
    // 策略2：设置防抖/延迟发送 (仅在Move时需要，Up/Down通常希望立即发送)
    else if (action === 'move') {
      this.scheduleFlush()
    } else {
      // Down 和 Up 动作建议立即 Flush，保证实时性
      this.flush()
    }
  }

  /**
   * 调度延迟刷新
   */
  private scheduleFlush() {
    if (this.timer) return // 如果已有计时器，继续等待，不重置（Throttle 模式）

    this.timer = window.setTimeout(() => {
      this.flush()
    }, this.options.flushDelay)
  }

  /**
   * 强制刷新缓冲区
   */
  public flush() {
    this.clearTimer()
    if (this.queue.length === 0) return

    // 触发回调
    this.options.onFlush([...this.queue]) // 发送副本
    this.queue = []
  }

  /**
   * 一次笔画结束，重置序列号（可选）
   */
  public resetSequence() {
    this.sequenceCounter = 0
    this.flush() // 确保残余数据发送
  }

  public clear() {
    this.clearTimer()
    this.queue = []
    this.sequenceCounter = 0
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
