<template>
  <div class="relative grow flex flex-col pt-10">
    <span class="absolute top-2 right-2.5 select-none" style="color: var(--game-font-color)">
      <UIcon name="ph:telegram-logo-fill" class="size-5 align-middle mr-1.5" />
      <img src="~/assets/icons/chat-msg-title.png" class="h-4 inline-block" />
    </span>
    <ui-game-main-room-message-list ref="RoomMessageList" class="grow" />
    <div class="p-[0.785rem]">
      <UInput
        v-model="chatMessageInputValue"
        placeholder="说点儿什么吧..."
        class="game-input w-full"
        size="sm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const RoomMessageListRef = useTemplateRef('RoomMessageList')

const chatMessageInputValue = ref('')
</script>

<style scoped></style>
