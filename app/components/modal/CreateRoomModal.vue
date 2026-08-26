<template>
  <UiBaseModal ref="baseModal" :parent="parent" close-on-esc="reject" close-on-mask="reject">
    <template #default>
      <div
        class="w-80 bg-texture rounded-md p-6 shadow-hard flex flex-col gap-4 select-none"
        tabindex="0"
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
            v-model="options.password"
            size="sm"
            maxlength="4"
            class="game-input w-32 ml-auto"
            placeholder="房间密码"
          />
        </div>
        <div class="flex justify-center gap-16 mt-2">
          <UiButton size="base" color="red" @click="onConfirm">创建房间</UiButton>
          <UiButton size="sm" @click="baseModal?.cancel()">取消</UiButton>
        </div>
      </div>
    </template>
  </UiBaseModal>
</template>

<script setup lang="ts">
export interface CreateRoomModalResult {
  opens: number
  password: string
  maxOnlookers: number
}

interface Props {
  parent?: Element
}

const { parent } = defineProps<Props>()

const baseModal = useTemplateRef('baseModal')

const options = ref<CreateRoomModalResult>({
  opens: 6,
  password: '',
  maxOnlookers: 5
})

const open = (): Promise<CreateRoomModalResult> => {
  return baseModal.value!.open()
}

const onConfirm = () => {
  baseModal.value?.close(options.value)
}

defineExpose({ open })
</script>
