<template>
  <Teleport :to="targetEl">
    <div
      v-if="visible"
      class="z-114514 flex items-center justify-center bg-transparent"
      :class="parent ? 'absolute inset-0' : 'fixed inset-0'"
    >
      <div ref="modalRef" class="bg-texture rounded-md w-90 shadow-hard flex flex-col" tabindex="0">
        <div class="h-40 p-4">
          <div class="h-full flex flex-col text-wood-700 text-shadow-light select-none">
            <div class="flex justify-between text-sm2">
              <span>你已离线</span>
            </div>

            <div class="grow flex flex-col justify-center items-center text-sm2">
              <p class="text-center">
                <span>{{ reason }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="flex justify-center gap-8 p-4 bg-tint-warm-700">
          <UiButton color="red" @click="refresh">重新连接</UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
export interface ThrowerModalProps {
  reason?: string
  parent?: Element
}
const { parent = '', reason = '与服务器断开连接' } = defineProps<ThrowerModalProps>()

const visible = ref(false)
const resolveFn = ref<(() => void) | null>(null)
const rejectFn = ref<(() => void) | null>(null)
const modalRef = ref<HTMLDivElement | null>(null)
const targetEl = computed(() => parent ?? document.body)

const ws = useWsStore()

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
}

const refresh = () => {
  ws.open()
  close()
}

onMounted(() => {})
onUnmounted(() => {})

defineExpose({ open })
</script>

<style scoped></style>
