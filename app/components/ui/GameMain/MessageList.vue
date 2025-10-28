<template>
  <UiScrollBar
    ref="MessageListScrollBar"
    v-model:scroll-on-buttom="isScrollOnBottom"
    :auto-hide="false"
    :delay="1"
    :style="{ '--scrollbar-color': '#bc966f', '--scrollbar-color-hover': '#cea57c' }"
    :size="7"
  >
    <div class="message-list relative">
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

      <template v-for="(item, index) in messageList" :key="index + item.type">
        <p
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
        </p>

        <p v-else-if="item.type === 'chat'" class="py-[0.3rem] first:pt-0 last:pb-0">
          <span class="text-[13px]">
            <UiAvatar class="size-6.5 align-top" :player="item.sender" />
            <span class="ml-2"> {{ item.sender.nickname }}： </span>
            <span class="break-normal wrap-break-word">{{ item.msg }}</span>
          </span>
        </p>

        <p v-else-if="item.type === 'action'">
          <span class="text-[13px]">
            <span class="text-pink-400">{{ item.sender.nickname }}</span>
            {{ item.msg }}
          </span>
        </p>

        <p v-else-if="item.type === 'system'">
          <USeparator
            class="select-none"
            :label="item.msg"
            :ui="{
              border: `border-[#AE9783]`,
              label: `text-[13px] text-[#AE9783]`
            }"
          />
        </p>

        <p v-else-if="item.type === 'broadcast'" class="py-[0.3rem] first:pt-0 last:pb-0">
          <span class="text-[13px]">
            <UiAvatar class="size-6.5 align-top" :player="item.sender" />
            <span class="ml-2">{{ item.sender.nickname }}</span>
            <span class="break-normal wrap-break-word">
              在{{ item.roomNumber }}号房间喊道：赶快<UiLinkButton
                color="red"
                @click="joinFromBroadcast(item.roomNumber)"
                >加入</UiLinkButton
              >我们一起游戏吧！
            </span>
          </span>
        </p>
      </template>
    </div>
  </UiScrollBar>
</template>

<script setup lang="ts">
import type { Player } from '~/interfaces/player'

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
      style?: TextStyle
    }

const { autoScroll = true, showNewMessageIndicator = false } = defineProps<MessageListProps>()

const messageList = reactive<IMessage[]>([])
const newMessageCount = ref(0)
const messageListScrollBarRef = useTemplateRef('MessageListScrollBar')

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

const joinFromBroadcast = (roomNumber: number) => {
  console.log(`[MessageList]`, `[JoinFromBroadcast]`, roomNumber)
}

defineExpose({
  addMessage,
  scrollToBottom,
  scrollToTop
})
</script>

<style scoped></style>
