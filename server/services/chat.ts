import { colors } from 'consola/utils'
import { getAppConfig } from '~~/server/services/app-config'
import {
  checkPlayerIsInLobby,
  checkPlayerIsInRoom,
  getPlayer,
  sendToLobby,
  sendToRoom
} from './player'
import { handleGuess, getChatContext } from './game'

import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('ChatService')

// 记录每个玩家下次允许发言的时间戳
const chatIntervalRecord = new Map<string, number>()

/**
 * 将消息中的答案文本替换为等长的 *
 * 使用全局替换，忽略大小写
 */
function maskAnswer(msg: string, answer: string): string {
  if (!answer) return msg
  const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return msg.replace(new RegExp(escaped, 'gi'), '*'.repeat(answer.length))
}

/**
 * 敏感词/关键词过滤
 * @TODO 接入敏感词过滤系统（如 DFA 算法或第三方服务）
 * @param msg 原始消息
 * @returns 过滤后的消息，敏感词替换为 *
 */
async function filterSensitiveWords(msg: string): Promise<string> {
  // TODO: 接入敏感词过滤系统
  return msg
}

/**
 * 玩家发言
 * @param user 用户信息
 * @param chatmsg 发言消息
 */
const say = async (user: UserData, chatmsg: string) => {
  const player = getPlayer(user.id)
  if (!player) throw new Error('玩家不存在')

  // 1 内容预处理（所有消息都走）
  let displayMsg = await filterSensitiveWords(chatmsg)

  // 2 游戏逻辑（仅房间内）
  if (checkPlayerIsInRoom(player.id)) {
    const roomNumber = player.state.roomNumber!
    const ctx = getChatContext(roomNumber, player.id)

    if (ctx) {
      // 画画阶段 + 未猜对 + 非画手 → 尝试猜词（用原始消息）
      if (ctx.shouldAttemptGuess) {
        const bingo = handleGuess(roomNumber, player.id, chatmsg)
        if (bingo) return // 猜对，游戏侧处理后续广播
      }

      // 已猜对 → 脱敏答案文本，防止泄露
      if (ctx.answerForMasking) {
        displayMsg = maskAnswer(displayMsg, ctx.answerForMasking)
      }
    }
  }

  // 3 冷却检查
  const now = Date.now()
  const config = await getAppConfig()

  const intervalSec = checkPlayerIsInRoom(player.id)
    ? config.game.room.time.chatIntervalTimeSecond
    : config.game.lobby.time.chatIntervalTimeSecond
  const intervalMs = intervalSec * 1000

  const nextAllowed = chatIntervalRecord.get(user.id) ?? 0
  if (now < nextAllowed) {
    const remaining = Math.ceil((nextAllowed - now) / 1000)
    throw new Error(`你太能说了吧，请 ${remaining} 秒后再试...`)
  }

  chatIntervalRecord.set(user.id, now + intervalMs)

  // 4 广播
  const payload = {
    type: 'chat:event:say' as const,
    sender: user,
    chatmsg: displayMsg,
    timestamp: now
  }

  if (checkPlayerIsInLobby(player.id)) {
    sendToLobby(payload)
  } else if (checkPlayerIsInRoom(player.id)) {
    sendToRoom(payload, player.state.roomNumber!)
  }

  logger.info(`Player ${colors.cyan(user.nickname)} say: ${colors.green(displayMsg)}`)
}

export { say }
