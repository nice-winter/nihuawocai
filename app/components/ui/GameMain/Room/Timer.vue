<template>
  <div class="size-16 flex items-center justify-center">
    <div class="size-11 flex items-center justify-center rounded-full bg-[#e31839] timer">
      <span class="text-2xl text-white font-bold leading-0 select-none">
        {{ seconds.toString() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const seconds = defineModel<number>('seconds', { required: true })

let timer: number | null = null

// 是否正在运行
const running = ref(false)

/** 清理定时器 */
const clear = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

/** 开始倒计时 */
const play = () => {
  if (running.value) return
  running.value = true

  clear()

  timer = setInterval(() => {
    if (seconds.value > 0) {
      seconds.value -= 1
    } else {
      // 到 0 自动停止
      pause()
    }
  }, 1000)
}

/** 暂停倒计时 */
const pause = () => {
  running.value = false
  clear()
}

watch(seconds, () => {
  if (running.value) {
    play()
  }
})

onMounted(play)

onBeforeUnmount(clear)

defineExpose({ play, pause })
</script>

<style scoped>
.timer {
  box-shadow:
    0 0 0 4px #ffffff,
    0 0 0 6px #e31839;
}
</style>
