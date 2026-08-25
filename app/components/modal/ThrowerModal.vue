<template>
  <UiBaseModal ref="baseModal" :parent="parent">
    <div ref="modalRef" class="bg-texture rounded-md w-90 shadow-hard flex flex-col" tabindex="0">
      <div class="h-40 p-4">
        <div class="flex flex-col gap-4 text-wood-700 text-shadow-light select-none">
          <div class="flex justify-between text-sm2">
            <span>{{ reason }}</span>
            <span
              >倒计时：<span class="text-game-red-500">{{ t }}</span></span
            >
          </div>

          <p class="text-sm2 text-center">
            答案：<span class="text-lg text-game-red-500 font-bold">【{{ answer }}】</span>
          </p>

          <div v-if="showThrowItem && !isThrowed" class="flex items-center justify-between px-20">
            <div
              class="size-9 flex items-center justify-center rounded-full bg-white cursor-pointer shadow-hard"
              @click="throwItemClick('egg')"
            >
              <UIcon name="custom:icon-egg" class="size-6" />
            </div>

            <div
              class="size-12 flex items-center justify-center rounded-full bg-white cursor-pointer shadow-hard"
              @click="throwItemClick('flower')"
            >
              <UIcon name="custom:icon-flower" class="size-9" />
            </div>

            <div
              class="size-9 flex items-center justify-center rounded-full bg-white cursor-pointer shadow-hard"
              @click="throwItemClick('slipper')"
            >
              <UIcon name="custom:icon-slipper" class="size-7" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center gap-8 p-4 bg-tint-warm-700">
        <UiButton color="red" @click="shared">分享美图</UiButton>
      </div>
    </div>
  </UiBaseModal>
</template>

<script setup lang="ts">
export interface ThrowerModalProps {
  answer?: string
  /** 结束原因（原始枚举或已转换的展示文本） */
  reason?: string
  seconds?: number
  showThrowItem?: boolean
  parent?: Element
}

const { parent, answer = '', reason = '', seconds = 5, showThrowItem = true } = defineProps<ThrowerModalProps>()

const { sendGift } = useGameStore()

const baseModal = useTemplateRef('baseModal')
const modalRef = ref<HTMLDivElement | null>(null)

const isThrowed = ref(false)

const { t, start } = useCountdown(seconds, () => baseModal.value?.close())

const throwItemClick = (type: 'egg' | 'flower' | 'slipper') => {
  isThrowed.value = true
  sendGift(type)
}

const open = (): Promise<void> => {
  isThrowed.value = false
  start()
  return baseModal.value!.open()
}

const shared = () => {
  // 分享
}

defineExpose({ open })
</script>
