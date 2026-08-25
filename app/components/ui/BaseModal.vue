<template>
  <Teleport :to="targetEl">
    <div
      v-if="visible"
      class="z-114514 flex items-center justify-center bg-transparent"
      :class="parent ? 'absolute inset-0' : 'fixed inset-0'"
      @keydown.esc="onEsc"
      @mousedown="onMaskDown"
      @mouseup="onMaskUp"
    >
      <slot :close="close" />
    </div>
  </Teleport>
</template>

<script setup lang="ts" generic="T = void">
export interface BaseModalProps {
  parent?: Element
  closeOnEsc?: boolean | 'reject'
  closeOnMask?: boolean | 'reject'
}

const { parent, closeOnEsc = false, closeOnMask = false } = defineProps<BaseModalProps>()

const visible = ref(false)
const resolveFn = ref<((value: T) => void) | null>(null)
const rejectFn = ref<(() => void) | null>(null)
const pressedOnMask = ref(false)
const targetEl = computed(() => parent ?? document.body)

const canClose = (behavior: boolean | 'reject'): boolean => behavior === true || behavior === 'reject'
const shouldReject = (behavior: boolean | 'reject'): boolean => behavior === 'reject'

const close = (value?: T) => {
  visible.value = false
  resolveFn.value?.(value as T)
}

const cancel = () => {
  visible.value = false
  rejectFn.value?.()
}

const onEsc = () => {
  if (!visible.value || !canClose(closeOnEsc)) return
  shouldReject(closeOnEsc) ? cancel() : close()
}

const onMaskDown = (e: MouseEvent) => {
  if (e.target === e.currentTarget) pressedOnMask.value = true
}

const onMaskUp = (e: MouseEvent) => {
  if (!pressedOnMask.value || e.target !== e.currentTarget) {
    pressedOnMask.value = false
    return
  }
  pressedOnMask.value = false
  if (!canClose(closeOnMask)) return
  shouldReject(closeOnMask) ? cancel() : close()
}

const open = (): Promise<T> => {
  visible.value = true
  return new Promise<T>((resolve, reject) => {
    resolveFn.value = resolve
    rejectFn.value = reject
  })
}

onUnmounted(() => rejectFn.value?.())

defineExpose({ open, close })
</script>
