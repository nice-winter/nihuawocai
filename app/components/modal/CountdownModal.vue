<template>
  <BaseModal ref="baseModal" :parent="parent">
    <div
      :key="t"
      class="text-5xl text-game-red-500 font-bold countdown-number select-none"
    >
      {{ t }}
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
interface Props {
  parent?: Element
  seconds?: number
}

const { parent, seconds = 5 } = defineProps<Props>()

const baseModal = useTemplateRef('baseModal')

const { t, start } = useCountdown(seconds, () => baseModal.value?.close())

const open = (): Promise<void> => {
  start()
  nextTick(() => {
    const el = document.querySelector('.countdown-number') as HTMLElement
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
  })
  return baseModal.value!.open()
}

defineExpose({ open })
</script>
