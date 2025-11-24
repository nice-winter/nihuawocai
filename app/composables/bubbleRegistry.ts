import { h, render, type VNode, type AppContext } from 'vue'
import BubbleInstance from '@/components/ui/GameMain/Room/BubbleInstance.vue'

interface BubbleRecord {
  vnode: VNode | null
  container: HTMLElement | null
  hideTimer: number | null
  rect: DOMRect
}

class BubbleRegistry {
  private map = new Map<string, BubbleRecord>()
  private parentElement: HTMLElement = document.body
  private appContext: AppContext | null = null

  public setAppContext(context: AppContext) {
    this.appContext = context
  }

  public setParent(container: HTMLElement | string) {
    const el =
      typeof container === 'string' ? document.querySelector<HTMLElement>(container) : container
    this.parentElement = el || document.body
  }

  private getOrCreateRecord(id: string): BubbleRecord {
    let record = this.map.get(id)
    if (!record) {
      record = {
        vnode: null,
        container: null,
        hideTimer: null,
        rect: new DOMRect() // 初始为空 rect
      }
      this.map.set(id, record)
    }
    return record
  }

  updateRect(id: string, rect: DOMRect) {
    // console.log('Updating rect for:', id, rect)
    const record = this.getOrCreateRecord(id)
    record.rect = rect // 存储最新的 rect
    const comp = record.vnode?.component
    if (comp) {
      comp.props.rect = rect
      comp.props.parentElement = this.parentElement
    }
  }

  show(id: string, message: string) {
    if (!this.map.get(id)) return

    const record = this.getOrCreateRecord(id)

    if (!record.vnode) {
      const container = document.createElement('div')
      this.parentElement.appendChild(container) // 插入先前设置的父元素

      const vnode = h(BubbleInstance, {
        id,
        message,
        rect: record.rect, // 使用存储的 rect
        parentElement: this.parentElement // 把设置的父元素传给气泡实例 props
      })

      // 将 App 上下文附加到 vnode
      if (this.appContext) {
        vnode.appContext = this.appContext
      }

      render(vnode, container) // 将创建的 vnode 和 container 存回 record

      record.vnode = vnode
      record.container = container
    }

    const comp = record.vnode.component
    if (!comp) return // 更新消息（因为 show 可能会被重复调用）

    comp.props.message = message // 如果 fade-out 中，取消

    if (record.hideTimer !== null) {
      clearTimeout(record.hideTimer)
      record.hideTimer = null
      comp.exposed?.cancelFade()
    }

    comp.exposed?.forceShow() // 2s 后 fade-out

    record.hideTimer = window.setTimeout(() => {
      comp.exposed?.startFadeOut()
    }, 3000)
  }

  /**
   * 销毁指定 ID 的气泡
   */
  public destroy(id: string) {
    const record = this.map.get(id)
    if (!record) {
      return
    }

    // console.log('Destroying bubble:', id) // 清除 timeout

    if (record.hideTimer !== null) {
      clearTimeout(record.hideTimer)
    }

    if (record.container) {
      render(null, record.container)
    }

    if (record.container) {
      record.container.remove()
    }

    this.map.delete(id)
  }

  /**
   * 销毁所有气泡
   */
  public destroyAll() {
    // console.log('Destroying all bubbles...')

    this.map.forEach((record) => {
      if (record.hideTimer !== null) {
        clearTimeout(record.hideTimer)
      }
      if (record.container) {
        render(null, record.container)
      }
      if (record.container) {
        record.container.remove()
      }
    })

    this.map.clear()
  }
}

export const bubbleRegistry = new BubbleRegistry()
