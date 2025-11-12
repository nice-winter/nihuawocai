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

    <div class="flex items-center p-[0.785rem]">
      <UInput
        ref="ChatMessageInputRef"
        v-model="chatMessageInputValue"
        placeholder="说点儿什么吧..."
        class="game-input flex-1"
        size="sm"
        @keydown.enter="sendChatMessage"
      >
        <template #trailing>
          <UPopover
            :content="{
              side: 'top',
              align: 'end',
              sideOffset: 12,
              alignOffset: -36
            }"
          >
            <img class="size-5 cursor-pointer" :src="'_nuxt/assets/faces/qq/14/png/14.png'" />

            <template #content>
              <UiScrollBar
                :auto-hide="false"
                :delay="1"
                :style="{ '--scrollbar-color': '#bc966f', '--scrollbar-color-hover': '#cea57c' }"
                :size="4"
              >
                <div class="max-h-30 select-none bg-texture scroll-auto">
                  <div class="w-50 grid grid-cols-6 gap-2 p-2">
                    <img
                      v-for="emoji in emojis"
                      :key="emoji.name"
                      :src="emoji.img"
                      class="size-5 cursor-pointer"
                      @click="selectEmoji(emoji.name)"
                    />
                  </div>
                </div>
              </UiScrollBar>
            </template>
          </UPopover>
        </template>
      </UInput>

      <UiLinkButton class="text-[13px] ml-2" @click="sendChatMessage">发 送</UiLinkButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defaultEmojis } from '#shared/defaultEmojis'
import { mockdata } from '#shared/utils/mockdata'

const testPlayer = ref(mockdata.players[0]!)

const ChatPanelMessageListRef = useTemplateRef('ChatPanelMessageList')
const ChatMessageInputRef = useTemplateRef('ChatMessageInputRef')

const chatMessageInputValue = ref('')

const emojis = defaultEmojis.sort((a, b) =>
  isFinite(+a.name) && isFinite(+b.name)
    ? +a.name - +b.name
    : isFinite(+a.name)
      ? -1
      : isFinite(+b.name)
        ? 1
        : 0
)

const selectEmoji = (emoji: string) => {
  chatMessageInputValue.value += `{:${emoji}:}`
  nextTick(() => {
    ChatMessageInputRef.value?.inputRef?.focus()
  })
}

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
      roomNumber: 4
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

<style scoped>
.game-input >>> input {
  padding-inline-end: 1.5rem;
}
</style>
