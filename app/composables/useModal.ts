import { h, render, nextTick, getCurrentInstance, type AppContext } from 'vue'

let vnode: ReturnType<typeof h> | null = null
let container: HTMLElement | null = null

export const useModal = <T>(component: Component, options: { parent?: string | Element } = {}) => {
  const current = getCurrentInstance()
  if (!current) throw new Error('useModal 必须在 setup 中调用')
  const appContext: AppContext = current.appContext

  const mount = (parentEl: Element) => {
    if (container) {
      render(null, container)
      container.remove()
      container = null
      vnode = null
    }

    container = document.createElement('div')
    parentEl.appendChild(container)

    vnode = h(component, { parent: parentEl })
    vnode.appContext = appContext
    render(vnode, container)

    const exposed = vnode.component?.exposed
    if (!exposed || typeof exposed.open !== 'function') {
      throw new Error('该组件未暴露 open 方法')
    }

    return {
      open: exposed.open as () => Promise<T>
    }
  }

  const resolveParent = (): Element | null => {
    if (typeof options.parent === 'string') {
      return document.querySelector(options.parent)
    }
    return options.parent ?? document.body
  }

  const parentEl = resolveParent()
  if (parentEl) {
    return mount(parentEl)
  }

  let modalInstance: { open: () => Promise<T> } | null = null
  nextTick(() => {
    const lateParent = resolveParent()
    if (!lateParent) throw new Error('parent 未找到')
    modalInstance = mount(lateParent)
  })

  return {
    open: async () => {
      await nextTick()
      if (!modalInstance) throw new Error('Modal 尚未初始化完成')
      return modalInstance.open()
    }
  }
}
