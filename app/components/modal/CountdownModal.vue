<template>
  <UiBaseModal ref="baseModal" :parent="parent">
    <div
      ref="numberEl"
      class="text-5xl text-game-red-500 font-bold countdown-number select-none"
    >
      {{ t }}
    </div>
  </UiBaseModal>
</template>

<script setup lang="ts">
interface Props {
  parent?: Element
  seconds?: number
  initialValue?: number
}

const { parent, seconds = 5, initialValue } = defineProps<Props>()

const baseModal = useTemplateRef('baseModal')
const numberEl = useTemplateRef<HTMLElement>('numberEl')

const actualSeconds = initialValue ?? seconds

const { t, start } = useCountdown(actualSeconds, () => baseModal.value?.close())

const playAnimation = () => {
  const el = numberEl.value
  if (el) {
    el.getAnimations().forEach((anim) => anim.cancel())
    el.animate(
      [
        { transform: 'scale(2)', opacity: 0.4, offset: 0 },
        { transform: 'scale(1)', opacity: 1, offset: 1 }
      ],
      { duration: 300, easing: 'ease-out', fill: 'forwards' }
    )
  }
}

watch(t, playAnimation)

const open = (): Promise<void> => {
  start()
  nextTick(playAnimation)
  return baseModal.value!.open()
}

defineExpose({ open })
</script>
