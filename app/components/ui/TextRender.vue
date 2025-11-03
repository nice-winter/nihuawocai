<!-- ParsedText.vue -->
<template>
  <span>
    <component
      v-for="(node, index) in nodes"
      :key="index"
      :is="getComponent(node)"
      v-bind="getProps(node)"
      @click="handleNodeClick(node)"
    >
      {{ getTextContent(node) }}
    </component>
  </span>
</template>

<script setup lang="ts">
import { useTextParser, type TextNode, type EmojiItem } from '@/components/ui/Text'
import { computed } from 'vue'

interface Props {
  text: string
  emojis: EmojiItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  linkClick: [url: string]
}>()

const { parseText } = useTextParser()

const nodes = computed(() =>
  parseText(props.text, {
    emojis: props.emojis,
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
