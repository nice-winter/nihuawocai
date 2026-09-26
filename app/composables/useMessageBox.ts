import { createVNode, render, type VNode } from 'vue'
import MessageBox, { type MessageBoxOptions } from '@/components/ui/MessageBox.vue'

let currentInstance: VNode | null = null
let cleanupTimer: ReturnType<typeof setTimeout> | null = null

export const useMessageBox = (options?: MessageBoxOptions) => {
  const show = (message: string): void => {
    // 先掐掉上一次的延时清理，否则它会误把本次实例的 currentInstance 清空
    if (cleanupTimer !== null) {
      clearTimeout(cleanupTimer)
      cleanupTimer = null
    }
    if (currentInstance) {
      render(null, currentInstance.el as HTMLElement)
      currentInstance = null
    }

    const container = document.createElement('div')
    const parent = document.querySelector(options?.parent || 'body') ?? document.body
    parent.appendChild(container)

    const vnode = createVNode(MessageBox, {
      message,
      duration: options?.duration,
      parent: options?.parent,
      offsetX: options?.offsetX,
      offsetY: options?.offsetY
    })

    render(vnode, container)
    currentInstance = vnode

    cleanupTimer = setTimeout(
      () => {
        render(null, container)
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
        currentInstance = null
        cleanupTimer = null
      },
      (options?.duration ?? 2000) + 300
    )
  }

  return { show }
}

export const gameMessageBox = useMessageBox({
  duration: 2000,
  parent: '#game-panel',
  offsetX: -115,
  offsetY: -40
})
