<template>
  <div class="flex flex-col">
    <div class="relative h-10">
      <span class="absolute top-2 right-[.785rem] text-(--game-font-color) select-none">
        <UIcon name="ph:telegram-logo-fill" class="size-5 align-text-bottom mr-1.5" />
        <span class="text-sm font-cuyuan">聊天信息</span>
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

      <UiLinkButton type="button" class="text-[13px] ml-2" @click="sendChatMessage"
        >发 送</UiLinkButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { defaultEmojis } from '#shared/defaultEmojis'
// import { mockdata } from '#shared/utils/mockdata'

// const testPlayer = ref(mockdata.players[0]!)
const { isSelf } = usePlayerStore()
const { loggedInPlayer } = storeToRefs(usePlayerStore())
const { currentRoom } = storeToRefs(useRoomStore())
const { say } = useChatStore()

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
  const chatmsg = chatMessageInputValue.value.trim()
  if (chatmsg !== '') {
    say(chatmsg)
    chatMessageInputValue.value = ''
  } else {
    ChatMessageInputRef.value?.inputRef?.focus()
  }

  // if (msg === 'bingo') {
  //   ChatPanelMessageListRef.value?.addMessage({
  //     type: 'action',
  //     sender: testPlayer.value,
  //     msg: '猜对了答案。'
  //   })
  //   chatMessageInputValue.value = ''
  //   return
  // }
  // if (msg === 'start') {
  //   ChatPanelMessageListRef.value?.addMessage({
  //     type: 'system',
  //     msg: '回合开始'
  //   })
  //   chatMessageInputValue.value = ''
  //   return
  // }
  // if (msg === 'broadcast') {
  //   ChatPanelMessageListRef.value?.addMessage({
  //     type: 'broadcast',
  //     sender: testPlayer.value,
  //     roomNumber: 4
  //   })
  //   chatMessageInputValue.value = ''
  //   return
  // }

  // if (msg) {
  //   ChatPanelMessageListRef.value?.addMessage({
  //     type: 'chat',
  //     sender: testPlayer.value,
  //     msg
  //   })
  //   chatMessageInputValue.value = ''
  // }
}

useEventBus('chat:event:say', ({ chatmsg, sender, timestamp }) => {
  ChatPanelMessageListRef.value?.addMessage({
    type: 'chat',
    sender,
    msg: chatmsg
  })
})

useEventBus('room:event:broadcast', ({ from, roomNumber, password, sender, timestamp }) => {
  // 非游戏状态下，才显示广播信息
  // 当然这里在服务端不要推送就好了，前端也顺手过滤下呗
  if (!currentRoom.value?.playing) {
    ChatPanelMessageListRef.value?.addMessage({
      type: 'broadcast',
      sender,
      roomNumber,
      password
    })
  }
})

useEventBus('current:room:event:player_leave', ({ player }) => {
  if (!currentRoom.value?.playing) return // 非游戏状态下不显示
  if (isSelf(player.id)) return // 如果是自己，则不显要显示事件，因为自己离开之后会闪一下
  ChatPanelMessageListRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `离开了房间`
  })
})

useEventBus('current:room:event:onlooker_join', ({ player }) => {
  if (!currentRoom.value?.playing) return // 非游戏状态下不显示
  ChatPanelMessageListRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `爬到了树上观看`
  })
})

useEventBus('current:room:event:onlooker_leave', ({ player }) => {
  if (!currentRoom.value?.playing) return // 非游戏状态下不显示
  ChatPanelMessageListRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `从树上离开了`
  })
})
</script>

<style scoped>
.game-input:deep(input) {
  padding-inline-end: 1.5rem;
}
</style>
