<template>
  <span ref="trigger">
    <slot />
  </span>
</template>

<script lang="ts" setup>
import { useScroll } from '@vueuse/core'

const props = defineProps<{
  id: string
}>()

const trigger = ref<HTMLElement | null>(null)

const syncRect = () => {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  bubbleRegistry.updateRect(props.id, rect)
}

const { isScrolling } = useScroll(window)

// 监听页面变化，同步位置
// @TODO: 这里暂时只监听滚动，实际上应该监听窗口大小变化更好些
watch(() => isScrolling.value, syncRect)
// 初次、布局更新时都同步位置
onMounted(syncRect)
onUpdated(syncRect)
// 组件卸载时，立即销毁该玩家的气泡
onUnmounted(() => bubbleRegistry.destroy(props.id))
</script>

<style scoped>
span {
  display: inline-block;
}
</style>
