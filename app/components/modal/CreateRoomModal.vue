<template>
  <Teleport :to="targetEl">
    <div
      v-if="visible"
      class="z-114514 flex items-center justify-center bg-transparent"
      :class="parent ? 'absolute inset-0' : 'fixed inset-0'"
      @mousedown="onMaskDown"
      @mouseup="onMaskUp"
    >
      <div
        ref="modalRef"
        class="bg-texture rounded-md p-6 w-80 shadow-hard flex flex-col gap-4 select-none"
        tabindex="0"
        @keydown.esc="onCancel"
      >
        <p class="text-sm2 font-bold text-center select-none">房间设置</p>

        <div class="flex gap-4 items-center">
          <span class="text-sm2">玩家座位数：</span>
          <UInputNumber
            v-model="options.opens"
            :min="0"
            :max="6"
            size="sm"
            class="w-32 ml-auto game-input"
          />
        </div>

        <div class="flex gap-4 items-center">
          <span class="text-sm2">最多几人旁观：</span>
          <UInputNumber
            v-model="options.maxOnlookers"
            :min="0"
            :max="10"
            size="sm"
            class="w-32 ml-auto game-input"
          />
        </div>
        <div class="flex gap-4 items-center">
          <span class="text-sm2">房间初始密码：</span>
          <UInput
            ref="passwordInputRef"
            v-model="options.password"
            size="sm"
            maxlength="4"
            class="game-input w-32 ml-auto"
            placeholder="房间密码"
          />
        </div>
        <div class="flex justify-center gap-16 mt-2">
          <UiButton size="base" color="red" @click="onConfirm">创建房间</UiButton>
          <UiButton size="sm" @click="onCancel">取消</UiButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
export interface PasswordModalProps {
  parent?: Element
}
const { parent = '' } = defineProps<PasswordModalProps>()

const visible = ref(false)
const options = ref<{ opens: number; password: string; maxOnlookers: number }>({
  opens: 6,
  password: '',
  maxOnlookers: 5
})
const resolveFn = ref<
  ((value: { opens: number; password: string; maxOnlookers: number }) => void) | null
>(null)
const rejectFn = ref<(() => void) | null>(null)
const pressedOnMask = ref(false)
const modalRef = ref<HTMLDivElement | null>(null)
const targetEl = computed(() => parent ?? document.body)

const open = (): Promise<{ opens: number; password: string; maxOnlookers: number }> => {
  visible.value = true

  return new Promise<{ opens: number; password: string; maxOnlookers: number }>(
    (resolve, reject) => {
      resolveFn.value = resolve
      rejectFn.value = reject
    }
  )
}

const close = () => {
  visible.value = false
}

const onConfirm = () => {
  resolveFn.value?.(options.value)
  close()
}

const onCancel = () => {
  rejectFn.value?.()
  close()
}

const handleGlobalEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value) {
    onCancel()
  }
}

const onMaskDown = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    pressedOnMask.value = true
  }
}
const onMaskUp = (e: MouseEvent) => {
  if (pressedOnMask.value && e.target === e.currentTarget) {
    close()
  }
  pressedOnMask.value = false
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalEsc)
})

defineExpose({ open })
</script>

<style scoped></style>
