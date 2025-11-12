<template>
  <span>
    <component
      :is="getComponent(node)"
      v-for="(node, index) in nodes"
      :key="index"
      v-bind="getProps(node)"
      @click="handleNodeClick(node)"
    >
      {{ getTextContent(node) }}
    </component>
  </span>
</template>

<script setup lang="ts">
import { defaultEmojis } from '#shared/defaultEmojis'

interface Props {
  text: string
  emojis?: EmojiItem[]
}

const { text, emojis = defaultEmojis } = defineProps<Props>()

const emit = defineEmits<{
  linkClick: [url: string]
}>()

const { parseText } = useTextParser()

const nodes = computed(() =>
  parseText(text, {
    emojis,
    onLinkClick: (url: string) => emit('linkClick', url)
  })
)

const getComponent = (node: TextNode) => {
  return typeof node === 'string' ? 'span' : (node as VNode).type
}

const getProps = (node: TextNode) => {
  return typeof node === 'string' ? {} : (node as VNode).props || {}
}

const getTextContent = (node: TextNode) => {
  return typeof node === 'string' ? node : (node as VNode).children
}

const handleNodeClick = (node: TextNode) => {
  if (typeof node !== 'string' && node.props && 'onClick' in node.props) {
    // 如果节点有点击处理器，调用它
    node.props.onClick()
  }
}
</script>

<style>
img.emoji {
  width: var(--emoji-size);
  height: var(--emoji-size);
}
</style>
