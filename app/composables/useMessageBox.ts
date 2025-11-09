import { createVNode, render, type VNode } from 'vue'
import MessageBox, { type MessageBoxOptions } from '@/components/ui/MessageBox.vue'

let currentInstance: VNode | null = null

export const useMessageBox = (options?: MessageBoxOptions) => {
  const show = (message: string): void => {
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

    setTimeout(
      () => {
        render(null, container)
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
        currentInstance = null
      },
      (options?.duration ?? 2000) + 300
    )
  }

  return { show }
}
