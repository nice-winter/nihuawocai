import {
  h,
  render,
  nextTick,
  getCurrentInstance,
  type AppContext,
  type Component,
  type VNode
} from 'vue'

export const useModal = <T>(
  component: Component,
  props: Record<string, unknown> = {},
  options: { parent?: string | Element } = {}
) => {
  const current = getCurrentInstance()
  if (!current) {
    throw new Error('useModal: useModal() 必须在 setup() 中调用')
  }
  const appContext: AppContext = current.appContext

  let vnode: VNode | null = null
  let container: HTMLElement | null = null

  /**
   * 卸载组件并移除 DOM
   */
  const unmount = () => {
    if (container) {
      render(null, container) // 触发 Vue 的卸载
      container.remove() // 从 DOM 中移除
    }
    vnode = null
    container = null
  }

  /**
   * 挂载组件并返回其 open 方法
   */
  const mount = (parentEl: Element): (() => Promise<T>) => {
    unmount()

    container = document.createElement('div')
    parentEl.appendChild(container)

    vnode = h(component, { ...props, parent: options.parent })
    vnode.appContext = appContext

    render(vnode, container)

    const exposed = vnode.component?.exposed
    if (!exposed || typeof exposed.open !== 'function') {
      unmount()
      throw new Error('useModal: 传入的组件没有暴露 open 方法')
    }

    return exposed.open as () => Promise<T>
  }

  /**
   * 解析父元素
   */
  const resolveParent = (): Element | null => {
    if (typeof options.parent === 'string') {
      return document.querySelector(options.parent)
    }

    return options.parent ?? document.body
  }

  const open = async (): Promise<T> => {
    await nextTick()

    const parentEl = resolveParent()
    if (!parentEl) {
      throw new Error('useModal: 未找到父元素 (parent)')
    }

    const internalOpen = mount(parentEl)

    try {
      const result = await internalOpen()
      return result
      // eslint-disable-next-line no-useless-catch
    } catch (e) {
      throw e
    } finally {
      unmount()
    }
  }

  return {
    open
  }
}
