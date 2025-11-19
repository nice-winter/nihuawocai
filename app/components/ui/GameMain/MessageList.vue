<template>
  <UContextMenu :items="contextMenuItems" size="sm" :press-open-delay="1">
    <UiScrollBar
      ref="MessageListScrollBar"
      v-model:scroll-on-buttom="isScrollOnBottom"
      :auto-hide="false"
      :delay="1"
      :style="{ '--scrollbar-color': '#bc966f', '--scrollbar-color-hover': '#cea57c' }"
      :size="7"
    >
      <div class="relative">
        <div
          v-show="autoScroll && showNewMessageIndicator && newMessageCount > 0"
          class="absolute bottom-1 right-[0.8rem] flex flex-col"
        >
          <div
            class="p-1 h-6 min-w-6 text-xs text-center text-white rounded-md select-none cursor-pointer"
            style="background-color: rgb(75 54 32 / 57%); border-bottom-right-radius: unset"
            @click="
              () => {
                scrollToBottom()
                newMessageCount = 0
              }
            "
          >
            <span>{{ newMessageCount }}</span>
          </div>
          <div>
            <span
              class="size-0 float-right"
              style="border-top: 2px solid rgb(75 54 32 / 57%); border-left: 4px solid transparent"
            />
          </div>
        </div>

        <ul class="message-list">
          <template v-for="(item, index) in messageList" :key="index + item.type">
            <li
              v-if="item.type === 'text'"
              class="message-item"
              :class="[`message-item-${item.type}`]"
              :style="{
                color: item.style?.color || 'inherit',
                fontSize: item.style?.fontSize || `13px`,
                fontWeight: item.style?.fontWeight || 'normal'
              }"
            >
              {{ item.msg }}
            </li>

            <li
              v-else-if="item.type === 'chat'"
              class="py-[0.3rem] first:pt-0 last:pb-0 text-[13px]"
            >
              <div class="inline-flex float-left">
                <UiAvatar
                  class="size-6.5 align-top"
                  :player="item.sender"
                  :verified-icon="{ show: true, size: 12, right: -2, bottom: -2 }"
                />
                <span class="ml-2 inline-block leading-6.5"> {{ item.sender.nickname }}：</span>
              </div>
              <UiTextRender
                class="break-normal wrap-break-word leading-6.5"
                :text="item.msg"
                style="--emoji-size: 18px"
              />
            </li>

            <li v-else-if="item.type === 'action'">
              <span class="text-[13px] text-[#7f7f7f]">
                <span class="text-pink-400">{{ item.sender.nickname }}</span>
                {{ item.msg }}
              </span>
            </li>

            <li v-else-if="item.type === 'system'">
              <USeparator
                class="select-none"
                :label="item.msg"
                :ui="{
                  border: `border-[#7f7f7f]`,
                  label: `text-[13px] text-[#7f7f7f]`
                }"
              />
            </li>

            <li v-else-if="item.type === 'broadcast'" class="py-[0.3rem] first:pt-0 last:pb-0">
              <span class="text-[13px]">
                <UiAvatar class="size-6.5 align-top" :player="item.sender" />
                <span class="ml-2">{{ item.sender.nickname }}</span>
                <span class="break-normal wrap-break-word">
                  在{{ item.roomNumber }}号房间喊道：赶快<UiLinkButton
                    color="red"
                    @click="() => joinFromBroadcast(item.roomNumber, item.password)"
                    >加入</UiLinkButton
                  >我们一起游戏吧！
                </span>
              </span>
            </li>
          </template>
        </ul>
      </div>
    </UiScrollBar>
  </UContextMenu>
</template>

<script setup lang="ts">
import type { Player } from '#shared/interfaces/player'
import type { ContextMenuItem } from '@nuxt/ui'

interface MessageListProps {
  autoScroll?: boolean
  showNewMessageIndicator?: boolean
}

interface TextStyle {
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
}

type IMessage =
  | {
      type: 'text'
      msg: string
      style?: TextStyle
    }
  | {
      type: 'chat'
      sender: Player
      msg: string
      style?: TextStyle
    }
  | {
      type: 'action'
      sender: Player
      msg: string
      style?: TextStyle
    }
  | {
      type: 'system'
      msg: string
      style?: TextStyle
    }
  | {
      type: 'broadcast'
      sender: Player
      roomNumber: number
      password: string
      style?: TextStyle
    }

const { autoScroll = true, showNewMessageIndicator = false } = defineProps<MessageListProps>()

const roomStore = useRoomStore()
const { join, leave } = roomStore
const { currentRoom } = storeToRefs(roomStore)

const messageList = reactive<IMessage[]>([])
const newMessageCount = ref(0)
const messageListScrollBarRef = useTemplateRef('MessageListScrollBar')
const selectText = useTextSelection()
const contextMenuItems = computed(() => {
  const items: ContextMenuItem[] = [
    {
      label: '清空',
      onSelect: () => clear()
    },
    {
      label: '复制',
      disabled: selectText.text.value == '',
      onSelect: () => copy()
    }
  ]
  return items
})
const { copy } = useClipboard({ source: selectText.text })

const addMessage = (msg: IMessage) => {
  messageList.push(msg)
  if (autoScroll) {
    if (isScrollOnBottom.value) {
      scrollToBottom()
    } else {
      newMessageCount.value++
    }
  }
}
const scrollToBottom = () => {
  setTimeout(() => {
    messageListScrollBarRef.value?.scrollTo({ top: 1145141919810 })
  }, 1)
}
const scrollToTop = () => {
  setTimeout(() => {
    messageListScrollBarRef.value?.scrollTo({ top: 0 })
  }, 1)
}
const isScrollOnBottom = ref(false)
watch(
  () => isScrollOnBottom.value,
  (newValue) => {
    if (newValue) newMessageCount.value = 0
  },
  { immediate: true }
)

const joinFromBroadcast = (roomNumber: number, password: string) => {
  // 如果玩家在房间中，则先退出房间再通过广播进入房间
  if (currentRoom.value !== null) {
    if (currentRoom.value.roomNumber === roomNumber) {
      gameMessageBox.show('你已经在这个房间里了')
      return
    } else {
      leave()
    }
  }

  nextTick(() => {
    setTimeout(() => join(roomNumber, password), 500)
  })
}

const clear = () => messageList.splice(0, messageList.length)

defineExpose({
  addMessage,
  scrollToBottom,
  scrollToTop,
  clear
})
</script>

<style scoped></style>
