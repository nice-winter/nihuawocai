import type { VNode } from 'vue'
import { h } from 'vue'
import LinkButton from '@/components/ui/LinkButton.vue'

export interface EmojiItem {
  name: string
  img: string
}

export interface ParseOptions {
  emojis: EmojiItem[]
  onLinkClick?: (url: string) => void
}

export type TextNode = string | VNode

export const useTextParser = () => {
  const parseText = (text: string, options: ParseOptions): TextNode[] => {
    const elements: TextNode[] = []
    let lastIndex = 0

    const regex = /(<a\s+[^>]*?href=(["'])(.*?)\2[^>]*?>([^<]*)<\/a>)|({:([^:]+):})/gi
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index))
      }

      if (match[1]) {
        // 匹配到 <a> 标签
        const href = match[3] || '' // 组 3: href 的 URL
        const linkText = match[4] || '' // 组 4: 链接内的文本 (无嵌套)

        elements.push(createLinkButton(linkText, href, options.onLinkClick))
      } else if (match[5]) {
        // 匹配到 emoji 标签 (组 5)
        const emojiName = match[6] // 组 6: emoji 名称
        const emoji = options.emojis.find((item) => item.name === emojiName)

        if (emoji) {
          elements.push(createEmojiImage(emoji))
        } else {
          elements.push(match[5]) // 推入原始的 emoji 占位符
        }
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex))
    }

    return elements
  }

  return {
    parseText
  }
}

const createLinkButton = (
  text: string,
  href: string,
  onLinkClick?: (url: string) => void
): VNode => {
  return h(LinkButton, { color: 'red', onClick: () => onLinkClick?.(href) }, text)
}

const createEmojiImage = (emoji: EmojiItem): VNode => {
  return h('img', {
    src: emoji.img,
    alt: emoji.name,
    class: 'inline-block -mt-0.5 emoji'
  })
}
