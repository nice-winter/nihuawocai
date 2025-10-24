<template>
  <UiScrollBar
    ref="MessageListScrollBar"
    :auto-hide="false"
    :delay="1"
    :style="{ '--scrollbar-color': '#bc966f', '--scrollbar-color-hover': '#cea57c' }"
    :size="7"
  >
    <div class="message-list">
      <template v-for="(i, index) in messageList" :key="index + i.type">
        <p
          v-if="i.type === 'text'"
          class="message-item"
          :class="[`message-item-${i.type}`]"
          :style="{
            color: i.style?.color || 'inherit',
            fontSize: i.style?.fontSize || `13px`,
            fontWeight: i.style?.fontWeight || 'normal'
          }"
        >
          {{ i.msg }}
        </p>
      </template>
    </div>
  </UiScrollBar>
</template>

<script setup lang="ts">
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
      sender: {
        uuid: string
        avatar: string
        nickname: string
      }
      msg: string
      style?: TextStyle
    }
  | {
      type: 'action'
      sender: {
        uuid: string
        avatar: string
        nickname: string
      }
      msg: string
      style?: TextStyle
    }
  | {
      type: 'broadcast'
      sender: {
        uuid: string
        avatar: string
        nickname: string
      }
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
