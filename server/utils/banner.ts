import { consola } from 'consola'
import { colors } from 'consola/utils'
import { useWordManager } from '~~/server/services/word'

const logger = consola.withTag('Startup')
const items: { icon: string; label: string; detail: string }[] = []

/** 计算字符串的终端显示宽度（CJK 字符算 2 列） */
function strWidth(str: string): number {
  let w = 0
  for (const ch of str) {
    const code = ch.codePointAt(0)!
    // CJK 统一汉字 + 扩展 A/B + 兼容汉字
    w += (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf) || (code >= 0xf900 && code <= 0xfaff) ? 2 : 1
  }
  return w
}

/**
 * 注册一个初始化模块到启动 banner
 */
export function registerBannerItem(item: { icon: string; label: string; detail: string }) {
  items.push(item)
}

/**
 * 显示启动 banner
 */
export async function showBanner() {
  const wordManager = useWordManager()
  const libIndex = await wordManager.getLibraryIndex()

  // 统计总词条数
  let totalWords = 0
  for (const libId of libIndex) {
    const lib = await wordManager.getLibraryById(libId)
    if (lib) totalWords += lib.words.length
  }

  // 注册词库信息
  registerBannerItem({
    icon: '📚',
    label: '词库就绪',
    detail: `${libIndex.length} 座词库  ·  ${totalWords} 个词条`
  })

  // 注册 WebSocket 信息
  registerBannerItem({
    icon: '🔌',
    label: 'WebSocket 就绪',
    detail: '心跳 30s'
  })

  // 注册认证服务
  registerBannerItem({
    icon: '🔐',
    label: '认证服务就绪',
    detail: 'nuxt-auth-utils'
  })

  const mode = import.meta.dev ? 'DEV' : 'PROD'
  const modeColor = import.meta.dev ? colors.yellow : colors.green

  // 空行
  console.log()

  // ── 顶部边框 ──
  logger.log(colors.dim('─'.repeat(50)))

  // ── 标题 ──
  logger.log(`  🎨  ${colors.bold('你画我猜')}  ·  ${colors.dim('Draw & Guess')}`)
  logger.log(`  ${colors.dim('v0.0.0')}  ·  ${modeColor(mode)}`)

  // ── 分隔线 ──
  logger.log(colors.dim('─'.repeat(50)))

  // ── 初始化模块列表 ──
  const labelWidth = 18 // 对齐目标：视觉宽度 18 列
  for (const item of items) {
    const pad = ' '.repeat(Math.max(0, labelWidth - strWidth(item.label)))
    logger.log(`  ${item.icon}  ${colors.greenBright(item.label)}${pad}${item.detail}`)
  }

  // ── 底部边框 ──
  logger.log(colors.dim('─'.repeat(50)))

  // 空行
  console.log()
}
