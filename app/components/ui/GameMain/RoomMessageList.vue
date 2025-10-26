<template>
  <UiScrollBar
    ref="MessageListScrollBar"
    :auto-hide="false"
    :delay="1"
    :style="{ '--scrollbar-color': '#bc966f', '--scrollbar-color-hover': '#cea57c' }"
    :size="7"
  >
    <div class="message-list">
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

        <div v-else-if="item.type === 'chat'" class="my-2 first:mt-0 last:mb-0">
          <span>
            <UiAvatar class="size-6.5 align-bottom" :player="item.sender" />
            <span class="ml-2 text-[13px]"> {{ item.sender.nickname }}： </span>
            <span class="text-[13px] break-normal wrap-break-word">{{ item.msg }}</span>
          </span>
        </div>
      </template>
    </div>
  </UiScrollBar>
</template>

<script setup lang="ts">
import type { Player } from '~/interfaces/player'

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

const messageList = reactive<IMessage[]>([])

const messageListScrollBarRef = useTemplateRef('MessageListScrollBar')

const addMessage = (msg: IMessage) => {
  messageList.push(msg)
  if (isScrollOnBottom()) {
    scrollToBottom()
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
const isScrollOnBottom = () => {
  const scrollData = messageListScrollBarRef.value?.getScrollData()

  if (scrollData) {
    const { scrollTop, scrollHeight, clientHeight } = scrollData

    if (scrollHeight < clientHeight) return true // 小于容器高度时，直接返回 true

    return scrollTop + clientHeight >= scrollHeight - 10 // 留点余量，就当它到底了吧...
  }

  return false
}

defineExpose({
  addMessage,
  scrollToBottom,
  scrollToTop
})
</script>

<style scoped>
.message-item {
}
</style>
