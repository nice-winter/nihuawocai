<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUpdated,
  onUnmounted,
  watch,
  cloneVNode,
  type VNode,
  type PropType
} from 'vue'
import { useScroll } from '@vueuse/core'

export default defineComponent({
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },

  setup(props, { slots }) {
    if (!slots.default) {
      throw new Error('<Bubble> requires a default slot content.')
    }

    let trackedVNode: VNode | null = null

    const getEl = (): HTMLElement | null => {
      return (trackedVNode?.el as HTMLElement) || null
    }

    const syncRect = () => {
      const el = getEl()
      if (!el) return
      bubbleRegistry.updateRect(props.id, el.getBoundingClientRect())
    }

    const { isScrolling } = useScroll(window)

    // 监听页面变化，同步位置
    // @TODO: 这里暂时只监听滚动，实际上应该监听窗口大小变化更好些
    watch(isScrolling, syncRect)

    // 初次、布局更新时同步位置
    onMounted(syncRect)
    onUpdated(syncRect)

    // 组件卸载时，立即销毁该玩家的气泡
    onUnmounted(() => bubbleRegistry.destroy(props.id))

    return () => {
      const children = slots.default!()

      if (children.length !== 1) {
        console.warn('<Bubble> only supports a single root element in the default slot.')
      }

      const vnodeToRender = cloneVNode(children[0]!)
      trackedVNode = vnodeToRender

      return vnodeToRender
    }
  }
})
</script>
