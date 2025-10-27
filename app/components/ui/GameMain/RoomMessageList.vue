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
        class="absolute bottom-0 right-[0.8rem] p-1 text-xs text-center text-(--game-font-color) rounded-sm select-none cursor-pointer"
        style="background-color: rgba(110, 64, 0, 0.17)"
        @click="
          () => {
            scrollToBottom()
            newMessageCount = 0
          }
        "
      >
        <span class="text-light">新消息 {{ newMessageCount }}</span>
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

        <p v-else-if="item.type === 'chat'" class="py-[0.3925rem] first:pt-0 last:pb-0">
          <span>
            <UiAvatar class="size-6.5 align-bottom" :player="item.sender" />
            <span class="ml-2 text-[13px]"> {{ item.sender.nickname }}： </span>
            <span class="text-[13px] break-normal wrap-break-word">{{ item.msg }}</span>
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

defineExpose({
  addMessage,
  scrollToBottom,
  scrollToTop
})
</script>

<style scoped></style>
