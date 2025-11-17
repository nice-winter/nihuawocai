import { onMounted, onUnmounted, isRef, type Ref, getCurrentInstance } from 'vue'
import { bubbleRegistry } from './bubbleRegistry'

type ParentTarget = string | HTMLElement | Ref<HTMLElement | null | undefined>

/**
 * 气泡组件组合式函数
 * @param parentTarget 用于挂载气泡的父元素。
 */
export const useBubble = (parentTarget: ParentTarget) => {
  const instance = getCurrentInstance()

  if (!instance) {
    throw new Error('useBubble must be called from within a component setup function.')
  }

  onMounted(() => {
    bubbleRegistry.setAppContext(instance.appContext)

    let element: HTMLElement | string | null | undefined = null

    if (isRef(parentTarget)) {
      element = parentTarget.value
    } else {
      element = parentTarget
    }

    if (element) {
      bubbleRegistry.setParent(element)
    } else {
      console.warn('useBubble: ParentTarget not found on mount. Defaulting to document.body.')
      bubbleRegistry.setParent(document.body)
    }
  })

  onUnmounted(() => {
    // 当使用此 hook 的组件卸载时，自动销毁所有气泡
    bubbleRegistry.destroyAll()
  })

  return {
    /** 显示一个气泡 */
    show: bubbleRegistry.show.bind(bubbleRegistry),

    /** 销毁指定 ID 的气泡 */
    destroy: bubbleRegistry.destroy.bind(bubbleRegistry),

    /** 销毁所有气泡 */
    destroyAll: bubbleRegistry.destroyAll.bind(bubbleRegistry)
  }
}
