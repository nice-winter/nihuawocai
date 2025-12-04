<template>
  <Teleport :to="targetEl">
    <div
      v-if="visible"
      class="z-114514 flex items-center justify-center bg-transparent countdown-container"
      :class="parent ? 'absolute inset-0' : 'fixed inset-0'"
    >
      <div
        :key="currentValue"
        class="text-5xl text-bland-red-500 font-bold countdown-number select-none"
      >
        {{ currentValue }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  parent?: Element
  seconds?: number
}

const { parent = '', seconds = 5 } = defineProps<Props>()

const currentValue = ref(seconds)
let countdownInterval: number | null = null

const visible = ref(false)
const resolveFn = ref<(() => void) | null>(null)
const rejectFn = ref<(() => void) | null>(null)
const targetEl = computed(() => parent ?? document.body)

const open = (): Promise<void> => {
  visible.value = true

  return new Promise<void>((resolve, reject) => {
    resolveFn.value = resolve
    rejectFn.value = reject
  })
}

const close = () => {
  resolveFn.value?.()
  visible.value = false
  if (countdownInterval) clearInterval(countdownInterval)
}

const playAnimation = () => {
  nextTick(() => {
    const el = document.querySelector('.countdown-number') as HTMLElement
    if (!el) return

    el.getAnimations().forEach((anim) => anim.cancel())

    el.animate(
      [
        { transform: 'scale(2)', opacity: 0.4, offset: 0 },
        { transform: 'scale(1)', opacity: 1, offset: 1 }
      ],
      {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
      }
    )
  })
}

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval)

  currentValue.value = seconds
  playAnimation()

  countdownInterval = window.setInterval(() => {
    if (currentValue.value > 1) {
      currentValue.value--
      playAnimation()
    } else {
      clearInterval(countdownInterval!)
      close()
    }
  }, 1000)
}

watch(
  () => seconds,
  () => {
    if (countdownInterval) clearInterval(countdownInterval!)
    startCountdown()
  }
)

onMounted(() => startCountdown())

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval!)
})

defineExpose({ open })
</script>

<style scoped></style>
