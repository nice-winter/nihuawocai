<template>
  <Transition name="fade">
    <div
      v-if="visible"
      ref="box"
      class="bg-black/80 text-sm2 text-white px-4 py-2 rounded-sm shadow-lg top-1/2 left-1/2 -translate-1/2 z-114514 select-none"
      :class="[!parent ? 'fixed' : 'absolute']"
      :style="style"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
export interface MessageBoxOptions {
  duration?: number
  parent?: string
  offsetX?: number
  offsetY?: number
}

interface Props extends MessageBoxOptions {
  message: string
}

const { duration = 2000, parent = undefined, offsetX = 0, offsetY = 0 } = defineProps<Props>()

const visible = ref(false)
const box = ref<HTMLElement | null>(null)

const style = computed(() => {
  return {
    top: `calc(50% + ${offsetY}px)`,
    left: `calc(50% + ${offsetX}px)`
  }
})

// immediate: false —— 计时从 show() 起算，而不是组件创建时就跑表
const { start: startHide, stop: stopHide } = useTimeoutFn(
  () => {
    visible.value = false
  },
  duration,
  { immediate: false }
)

const show = () => {
  visible.value = true
  stopHide() // 取消上一次计时（无 pending 时是 no-op）
  startHide()
}

onMounted(() => {
  show()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
