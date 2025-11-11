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
        class="bg-texture rounded-md p-6 w-80 shadow-hard flex flex-col gap-4"
        tabindex="0"
        @keydown.esc="onCancel"
      >
        <p class="text-[13px] text-center select-none">请输入房间密码</p>
        <UInput
          ref="passwordInputRef"
          v-model="password"
          size="sm"
          maxlength="8"
          class="game-input w-full"
          placeholder="房间密码"
          @keydown.enter.prevent="onConfirm"
        />
        <div class="flex justify-center gap-4 mt-2">
          <UiButton size="sm" color="red" @click="onConfirm">加入</UiButton>
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
const password = ref('')
const resolveFn = ref<((value: string) => void) | null>(null)
const rejectFn = ref<(() => void) | null>(null)
const pressedOnMask = ref(false)
const passwordInputRef = useTemplateRef('passwordInputRef')
const modalRef = ref<HTMLDivElement | null>(null)
const targetEl = computed(() => parent ?? document.body)

const open = (): Promise<string> => {
  password.value = ''
  visible.value = true

  nextTick(() => passwordInputRef.value?.inputRef?.focus())

  return new Promise<string>((resolve, reject) => {
    resolveFn.value = resolve
    rejectFn.value = reject
  })
}

const close = () => {
  visible.value = false
}

const onConfirm = () => {
  if (!password.value) {
    nextTick(() => passwordInputRef.value?.inputRef?.focus())
    return
  }
  resolveFn.value?.(password.value)
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
