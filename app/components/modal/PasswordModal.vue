<template>
  <BaseModal ref="baseModal" :parent="parent" close-on-esc="reject" close-on-mask="reject">
    <template #default="{ close }">
      <div
        class="bg-texture rounded-md p-6 w-80 shadow-hard flex flex-col gap-4"
        tabindex="0"
      >
        <p class="text-sm2 text-center select-none">请输入房间密码</p>
        <UInput
          ref="passwordInputRef"
          v-model="password"
          size="sm"
          maxlength="8"
          class="game-input w-full"
          placeholder="房间密码"
          @keydown.enter.prevent="onConfirm"
        />
        <div class="flex justify-center gap-8 mt-2">
          <UiButton size="sm" color="red" @click="onConfirm">加入</UiButton>
          <UiButton size="sm" @click="close()">取消</UiButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
interface Props {
  parent?: Element
}

const { parent } = defineProps<Props>()

const baseModal = useTemplateRef('baseModal')
const passwordInputRef = useTemplateRef('passwordInputRef')

const password = ref('')

const open = (): Promise<string> => {
  password.value = ''
  nextTick(() => passwordInputRef.value?.inputRef?.focus())
  return baseModal.value!.open()
}

const onConfirm = () => {
  if (!password.value) {
    nextTick(() => passwordInputRef.value?.inputRef?.focus())
    return
  }
  baseModal.value?.close(password.value)
}

defineExpose({ open })
</script>
