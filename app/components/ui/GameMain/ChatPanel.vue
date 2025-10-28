<template>
  <div class="flex flex-col">
    <div class="relative h-10">
      <span
        class="absolute top-2 right-[.785rem] select-none"
        style="color: var(--game-font-color)"
      >
        <UIcon name="ph:telegram-logo-fill" class="size-5 align-middle mr-1.5" />
        <img src="~/assets/icons/chat.png" class="h-4 inline-block" />
      </span>
    </div>

    <UiGameMainMessageList
      ref="ChatPanelMessageList"
      class="grow basis-0 px-[0.785rem] min-h-0"
      :show-new-message-indicator="true"
    />

    <div class="p-[0.785rem]">
      <UInput
        v-model="chatMessageInputValue"
        placeholder="说点儿什么吧..."
        class="game-input w-full"
        size="sm"
        @keydown.enter="sendChatMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const testPlayer = ref(players[0]!)

const ChatPanelMessageListRef = useTemplateRef('ChatPanelMessageList')

const chatMessageInputValue = ref('')
const sendChatMessage = () => {
  const msg = chatMessageInputValue.value.trim()

  if (msg === 'bingo') {
    ChatPanelMessageListRef.value?.addMessage({
      type: 'action',
      sender: testPlayer.value,
      msg: '猜对了答案。'
    })
    chatMessageInputValue.value = ''
    return
  }
  if (msg === 'start') {
    ChatPanelMessageListRef.value?.addMessage({
      type: 'system',
      msg: '回合开始'
    })
    chatMessageInputValue.value = ''
    return
  }
  if (msg === 'broadcast') {
    ChatPanelMessageListRef.value?.addMessage({
      type: 'broadcast',
      sender: testPlayer.value,
      roomNumber: 0
    })
    chatMessageInputValue.value = ''
    return
  }

  if (msg) {
    ChatPanelMessageListRef.value?.addMessage({
      type: 'chat',
      sender: testPlayer.value,
      msg
    })
    chatMessageInputValue.value = ''
  }
}
</script>

<style scoped></style>
