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

export function useTextParser() {
  const parseText = (text: string, options: ParseOptions): TextNode[] => {
    const elements: TextNode[] = []
    let lastIndex = 0

    const regex = /(<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>)|({:([^:]+):})/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index))
      }

      if (match[1]) {
        const href = match[2] || ''
        const linkText = match[3] || ''

        elements.push(createLinkButton(linkText, href, options.onLinkClick))
      } else if (match[4]) {
        const emojiName = match[5]
        const emoji = options.emojis.find((item) => item.name === emojiName)

        if (emoji) {
          elements.push(createEmojiImage(emoji))
        } else {
          elements.push(match[4])
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

function createLinkButton(text: string, href: string, onLinkClick?: (url: string) => void): VNode {
  return h(LinkButton, { color: 'red', onClick: () => onLinkClick?.(href) }, text)
}

function createEmojiImage(emoji: EmojiItem): VNode {
  return h('img', {
    src: emoji.img,
    alt: emoji.name,
    class: 'emoji'
  })
}
