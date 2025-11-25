<template>
  <Teleport :to="targetEl">
    <div
      v-if="visible"
      class="z-114514 flex items-center justify-center bg-transparent"
      :class="parent ? 'absolute inset-0' : 'fixed inset-0'"
    >
      <div ref="modalRef" class="bg-texture rounded-md w-90 shadow-hard flex flex-col" tabindex="0">
        <div class="h-40 p-4">
          <div class="flex flex-col gap-4 text-[#804B19] text-light select-none">
            <div class="flex justify-between text-[13px]">
              <span>{{ reason }}</span>
              <span
                >倒计时：<span class="text-(--game-red)">{{ t }}</span></span
              >
            </div>

            <p class="text-[13px] text-center">
              答案：<span class="text-lg text-(--game-red) font-bold">【{{ answer }}】</span>
            </p>

            <div v-if="showThrowItem && !isThrowed" class="flex items-center justify-between px-20">
              <div
                class="size-9 flex items-center justify-center rounded-full bg-white cursor-pointer shadow-hard"
                @click="() => throwItemClick('egg')"
              >
                <UIcon name="custom:icon-egg" class="size-6" />
              </div>

              <div
                class="size-12 flex items-center justify-center rounded-full bg-white cursor-pointer shadow-hard"
                @click="() => throwItemClick('flower')"
              >
                <UIcon name="custom:icon-flower" class="size-9" />
              </div>

              <div
                class="size-9 flex items-center justify-center rounded-full bg-white cursor-pointer shadow-hard"
                @click="() => throwItemClick('slipper')"
              >
                <UIcon name="custom:icon-slipper" class="size-7" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center gap-8 p-4 bg-[#c5630e69]">
          <UiButton color="red" @click="shared">分享美图</UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
export interface ThrowerModalProps {
  answer?: ''
  reason?: 'give_up' | 'bingo_all' | 'timeout' | 'afk' | 'force' | 'leave'
  seconds?: number
  showThrowItem?: boolean
  parent?: Element
}
const {
  parent = '',
  answer = '',
  reason = '',
  seconds = 5,
  showThrowItem = true
} = defineProps<ThrowerModalProps>()

const { sendGift } = useGameStore()

const visible = ref(false)
const resolveFn = ref<(() => void) | null>(null)
const rejectFn = ref<(() => void) | null>(null)
const modalRef = ref<HTMLDivElement | null>(null)
const targetEl = computed(() => parent ?? document.body)

const t = ref(seconds)
const timer = ref<number | null>(null)
const isThrowed = ref(false)

const throwItemClick = (type: 'egg' | 'flower' | 'slipper') => {
  console.log(type)
  isThrowed.value = true
  sendGift('flower')
}

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
  clearTimeout(timer.value!)
}

const shared = () => {
  // 分享
}

onMounted(() => {
  timer.value = setInterval(() => {
    t.value--
    if (t.value === 0) {
      close()
    }
  }, 1000)
})
onUnmounted(() => {
  clearTimeout(timer.value!)
})

defineExpose({ open })
</script>

<style scoped></style>
