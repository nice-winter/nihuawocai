<template>
  <div class="flex flex-col">
    <div class="relative h-10">
      <span class="absolute top-2 right-tight text-(--game-font-color) select-none">
        <UIcon name="ph:telegram-logo-fill" class="size-5 align-text-bottom mr-1.5" />
        <span class="text-sm font-cuyuan">聊天信息</span>
      </span>
    </div>

    <UiGameMainMessageList
      ref="ChatPanelMessageList"
      class="grow basis-0 px-tight min-h-0"
      :show-new-message-indicator="true"
    />

    <div class="flex items-center p-tight">
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
                <div class="relative max-h-30 bg-texture scroll-auto select-none">
                  <div class="w-50 grid grid-cols-6 gap-1 p-2">
                    <div
                      v-for="emoji in emojis"
                      :key="emoji.name"
                      class="size-6 flex justify-center items-center rounded cursor-pointer hover:bg-[#5035024d]"
                    >
                      <img :src="emoji.img" class="size-5" @click="selectEmoji(emoji.name)" />
                    </div>
                  </div>
                </div>
              </UiScrollBar>
            </template>
          </UPopover>
        </template>
      </UInput>

      <UiLinkButton type="button" class="text-sm2 ml-2" @click="sendChatMessage"
        >发 送</UiLinkButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { defaultEmojis } from '#shared/defaultEmojis'
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
}

watch(
  () => currentRoom.value?.playing,
  () => {
    ChatPanelMessageListRef.value?.clear()
  }
)

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

// 游戏事件通知
useEventBus('game:event:round:prepare', ({ drawerPlayer }) => {
  ChatPanelMessageListRef.value?.addMessage({
    type: 'system',
    msg: '回合开始'
  })
  ChatPanelMessageListRef.value?.addMessage({
    type: 'text',
    msg: `本回合由 ${drawerPlayer.nickname} 作画。`
  })
})
useEventBus('game:event:drawing:start', ({ drawerPlayer }) => {
  ChatPanelMessageListRef.value?.addMessage({
    type: 'action',
    sender: drawerPlayer,
    msg: `开始作画...`
  })
})
useEventBus('game:event:prompt', ({ index, content }) => {
  ChatPanelMessageListRef.value?.addMessage({
    type: 'prompt',
    index,
    content
  })
})
useEventBus('game:event:guess:bingo', ({ player }) => {
  ChatPanelMessageListRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `猜对了答案！`
  })
})
useEventBus('game:event:interaction:start', ({ drawerPlayer, reason, bingo_players }) => {
  switch (reason) {
    case 'afk': {
      ChatPanelMessageListRef.value?.addMessage({
        type: 'action',
        sender: drawerPlayer,
        msg: `超时未作画，本回合结束。`
      })
      break
    }
    case 'bingo_all': {
      ChatPanelMessageListRef.value?.addMessage({
        type: 'action',
        sender: drawerPlayer,
        msg: `的画被所有人猜对了，本回合结束。`
      })
      break
    }
    case 'force': {
      //
      break
    }
    case 'give_up': {
      ChatPanelMessageListRef.value?.addMessage({
        type: 'action',
        sender: drawerPlayer,
        msg: `放弃作画。`
      })
      break
    }
    case 'leave': {
      ChatPanelMessageListRef.value?.addMessage({
        type: 'action',
        sender: drawerPlayer,
        msg: `离开了房间，本回合结束。`
      })
      break
    }
    case 'timeout': {
      let msg = ''
      if (bingo_players.length === 0) msg = '没有人猜对。'
      if (bingo_players.length === 1) msg = '只有1人猜对。'
      if (bingo_players.length > 1) msg = `共有${bingo_players.length}人猜对。`
      ChatPanelMessageListRef.value?.addMessage({
        type: 'text',
        msg: `作画时间到，${msg}`
      })
      break
    }
  }
  ChatPanelMessageListRef.value?.addMessage({
    type: 'system',
    msg: '回合结束'
  })
})
useEventBus('game:event:interaction:gift', ({ fromPlayer, item_type }) => {
  switch (item_type) {
    case 'flower': {
      ChatPanelMessageListRef.value?.addMessage({
        type: 'action',
        sender: fromPlayer,
        msg: `赠送了鲜花~`
      })
      break
    }
    case 'egg': {
      ChatPanelMessageListRef.value?.addMessage({
        type: 'action',
        sender: fromPlayer,
        msg: `扔出了鸡蛋...`
      })
      break
    }
    case 'slipper': {
      ChatPanelMessageListRef.value?.addMessage({
        type: 'action',
        sender: fromPlayer,
        msg: `扔出了带脚气的拖鞋...`
      })
      break
    }
  }
})
useEventBus('game:event:settlement', () => {
  ChatPanelMessageListRef.value?.addMessage({
    type: 'system',
    msg: '游戏结束'
  })
})
</script>

<style scoped>
.game-input:deep(input) {
  padding-inline-end: 1.5rem;
}
</style>
