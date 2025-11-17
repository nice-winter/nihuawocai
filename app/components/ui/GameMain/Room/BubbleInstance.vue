<template>
  <div
    class="absolute z-999 p-1 bg-white rounded-xl border-black/80 border-[1.5px] text-sm bubble"
    :class="{ fadeOut }"
    :style="style"
  >
    <UiTextRender :text="message" :style="'--emoji-size: 20px'" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  id: string
  message: string
  rect: DOMRect
  // 挂载的父元素
  parentElement: HTMLElement
}>()

const fadeOut = ref(false)

const style = computed(() => {
  const r = props.rect // 触发器元素相对父元素的 rect
  if (!props.parentElement) return {}

  // 计算位置，相对于父元素
  const parentRect = props.parentElement.getBoundingClientRect()
  const relativeTop = r.top - parentRect.top
  const relativeLeft = r.left - parentRect.left

  return {
    left: `${relativeLeft + r.width / 2}px`,
    top: `${relativeTop - 10}px`,
    transform: `translateX(-50%) translateY(-100%)`
  }
})

const forceShow = () => {
  fadeOut.value = false
}

const startFadeOut = () => {
  fadeOut.value = true
}

const cancelFade = () => {
  fadeOut.value = false
}

defineExpose({ forceShow, startFadeOut, cancelFade })
</script>

<style scoped>
.bubble {
  white-space: nowrap;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s;
}
.bubble.fadeOut {
  opacity: 0;
}
</style>
