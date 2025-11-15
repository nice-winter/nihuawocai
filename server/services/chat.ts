import { consola } from 'consola'
import { colors } from 'consola/utils'
import { getAppConfig } from '~~/server/services/app-config'
import type { UserData } from '#shared/interfaces/userData'
import { getPlayer, sendToLobby, sendToRoom } from './player'

const logger = consola.withTag('Chat Service')

// 记录每个玩家下次允许发言的时间戳
const chatIntervalRecord = new Map<string, number>()

/**
 * 玩家发言
 * @TODO 需要完善屏蔽词过滤、联动游戏回答逻辑
 * @param user 用户信息
 * @param chatmsg 发言消息
 */
const say = async (user: UserData, chatmsg: string) => {
  const player = getPlayer(user.id)
  if (!player) throw new Error('玩家不存在')

  const now = Date.now()
  const config = await getAppConfig()

  // 根据玩家所在状态，选取不同冷却时间
  const intervalSec =
    player.state === 'in_room'
      ? config.game.room.time.chatIntervalTimeSecond
      : config.game.lobby.time.chatIntervalTimeSecond

  const intervalMs = intervalSec * 1000

  const nextAllowed = chatIntervalRecord.get(user.id) ?? 0
  if (now < nextAllowed) {
    const remaining = Math.ceil((nextAllowed - now) / 1000)
    throw new Error(`你太能说了吧，请 ${remaining} 秒后再试...`)
  }

  // 更新下一次可发言时间
  chatIntervalRecord.set(user.id, now + intervalMs)

  // 按状态广播消息
  if (player.state === 'lobby') {
    sendToLobby({
      type: 'chat:event:say',
      sender: user,
      chatmsg,
      timestamp: now
    })
  } else if (player.state === 'in_room' && typeof player.roomNumber !== 'undefined') {
    sendToRoom(
      {
        type: 'chat:event:say',
        sender: user,
        chatmsg,
        timestamp: now
      },
      player.roomNumber
    )
  }

  logger.info(`Player ${colors.cyan(user.nickname)} say: ${colors.green(chatmsg)}`)
}

export { say }
