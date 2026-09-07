import { colors } from 'consola/utils'
import { defineHooks } from 'crossws'
import { wsEventBus } from './core/events'
import { resolveUserFromPeer } from './core/connection'
import { safeSend, reply } from './utils'
import handlers from './handlers'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('WebSocket')

// 心跳配置
const HEARTBEAT = {
  interval: 30_000 // 30秒发一次 Ping
}

export const hooks = defineHooks({
  async upgrade(request) {
    await requireUserSession(request)
  },

  async open(peer) {
    const { session, userData } = await resolveUserFromPeer(peer)
    if (!session || !userData) return

    peer.context._is_alive = true

    peer.context._hb_timer = setInterval(() => {
      if (peer.context._is_alive === false) {
        logger.warn(`心跳超时，断开连接: ${colors.gray(peer.id)}`)
        peer.terminate()
        return
      }

      peer.context._is_alive = false

      safeSend(peer, WS_MESSAGE_PING)
    }, HEARTBEAT.interval)

    wsEventBus.emit('ws:connect', { peer, user: userData, reply: reply(peer) })
  },

  async message(peer, message) {
    try {
      const msg = decode(message.uint8Array()) as WebsocketMessage<{ rid?: string }>

      if (!msg || !msg.type) return

      if (msg.type === WS_MESSAGE_PONG.type) {
        peer.context._is_alive = true
        return
      }

      if (msg.type === WS_MESSAGE_PING.type) {
        safeSend(peer, WS_MESSAGE_PONG)
        peer.context._is_alive = true // 收到了 Ping 也说明活着
        return
      }

      const { userData } = await resolveUserFromPeer(peer)
      if (!userData) return

      wsEventBus.emit('ws:message', {
        peer,
        msg,
        user: userData,
        reply: reply(peer, msg.rid?.substring(0, 36))
      })
    } catch (e) {
      logger.warn('消息处理错误:', e)
      reply(peer)({ type: 'error', message: 'Invalid message' })
    }
  },

  async close(peer, e) {
    if (peer.context._hb_timer) {
      clearInterval(peer.context._hb_timer as number)
      peer.context._hb_timer = null
    }

    const { userData } = await resolveUserFromPeer(peer)
    wsEventBus.emit('ws:disconnect', { peer, user: userData, ...e })
    logger.info(
      `连接关闭: ${colors.cyan(userData?.nickname ?? 'unknown')}@${colors.gray(peer.id)}`,
      `code=${colors.yellow(String(e?.code ?? ''))} reason=${e?.reason ?? ''}`
    )
  },

  async error(peer, error) {
    const { userData } = await resolveUserFromPeer(peer)
    wsEventBus.emit('ws:error', { peer, user: userData, error })
    logger.error(
      `WebSocket 错误: ${colors.cyan(userData?.nickname ?? 'unknown')}@${colors.gray(peer.id)}`,
      error
    )
  }
})

handlers()

export { wsEventBus }
