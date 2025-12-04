<template>
  <div class="size-16 flex items-center justify-center">
    <div class="size-11 flex items-center justify-center rounded-full bg-game-red-450 timer">
      <span class="text-2xl text-white font-bold leading-0 select-none">
        {{ seconds.toString() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const seconds = defineModel<number>('seconds', { required: true })

const { playSound, stopSound } = useSound()

let timer: number | null = null

// 是否正在运行倒计时
const running = ref(false)

// 是否已经触发过 clock 播放（避免重复 play）
const clockStarted = ref(false)

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

  // 如需重开计时，先停掉 clock（避免之前残留）
  clockStarted.value = false
  stopSound('clock')

  clear()

  timer = setInterval(() => {
    if (seconds.value > 0) {
      seconds.value -= 1
    } else {
      pause()
    }
  }, 1000)
}

/** 暂停倒计时 */
const pause = () => {
  running.value = false
  clear()

  // 停止循环音效
  stopSound('clock')
  clockStarted.value = false
}

/** 监听秒数变化，用来触发 10 秒以下的 clock */
watch(seconds, (newVal) => {
  if (!running.value) return

  // 进入 10 秒区间
  if (newVal <= 10 && !clockStarted.value) {
    playSound('clock') // 只需 play 一次（loop 自动循环）
    clockStarted.value = true
  }

  // 时间到、保护逻辑
  if (newVal <= 0) {
    stopSound('clock')
    clockStarted.value = false
  }
})

onBeforeUnmount(() => {
  clear()
  stopSound('clock')
})

defineExpose({ play, pause })
</script>

<style scoped>
.timer {
  box-shadow:
    0 0 0 4px #ffffff,
    0 0 0 6px #e31839;
}
</style>
