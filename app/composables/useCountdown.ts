/**
 * 倒计时 composable
 * @param seconds - 倒计时秒数
 * @param onEnd - 倒计时结束回调
 */
export const useCountdown = (seconds: number, onEnd?: () => void) => {
  const t = ref(seconds)
  let timer: ReturnType<typeof setInterval> | null = null

  const start = () => {
    stop()
    t.value = seconds
    timer = setInterval(() => {
      t.value--
      if (t.value <= 0) {
        stop()
        onEnd?.()
      }
    }, 1000)
  }

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(() => stop())

  return { t, start, stop }
}
