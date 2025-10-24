<template>
  <div class="chat-panel">
    <span
      class="select-none"
      style="position: absolute; top: 8px; right: 10px; color: var(--game-font-color)"
    >
      <UIcon
        name="ph:chat-circle-dots-fill"
        class="size-5"
        style="vertical-align: text-bottom; margin-right: 6px"
      />
      <span style="font-weight: bolder">聊天消息</span>
    </span>
    <ui-game-main-room-message-list ref="RoomMessageList" class="chat-message-list" />
    <div class="chat-message-input">
      <UInput v-model="chatMessageInputValue" placeholder="说点儿什么吧..." class="game-input" />
    </div>
  </div>
</template>

<script setup lang="ts">
const RoomMessageListRef = useTemplateRef('RoomMessageList')

const chatMessageInputValue = ref('')
</script>

<style scoped>
.chat-panel {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 2.5rem;

  .chat-message-list {
    flex-grow: 1;
  }
  .chat-message-input {
    padding: 0.785rem;
  }
}
</style>
