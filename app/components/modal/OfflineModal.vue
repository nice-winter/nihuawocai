<template>
  <BaseModal ref="baseModal" :parent="parent">
    <div ref="modalRef" class="w-90 bg-texture rounded-md shadow-hard flex flex-col" tabindex="0">
      <div class="h-40 p-4">
        <div class="h-full flex flex-col text-wood-700 text-shadow-light select-none">
          <div class="flex justify-between text-sm2">
            <span>你已离线</span>
          </div>

          <div class="flex-1 flex flex-col justify-center items-center text-sm2">
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
  </BaseModal>
</template>

<script setup lang="ts">
export interface OfflineModalProps {
  reason?: string
  parent?: Element
}

const { parent, reason = '与服务器断开连接' } = defineProps<OfflineModalProps>()

const baseModal = useTemplateRef('baseModal')
const modalRef = ref<HTMLDivElement | null>(null)

const ws = useWsStore()

const open = (): Promise<void> => {
  return baseModal.value!.open()
}

const refresh = () => {
  ws.open()
  baseModal.value?.close()
}

defineExpose({ open })
</script>
