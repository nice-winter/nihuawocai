import { consola } from 'consola'
import { colors } from 'consola/utils'
import mitt from 'mitt'
import { defineHooks } from 'crossws'
// import { encode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG, WS_MESSAGE_DUPLICATE_LOGIN } from '#shared/interfaces/ws'
import { getUserData } from '~~/server/services/user'
import { isOpen, reply, safeSend } from './utils'
import handlers from './handlers'
import { addPlayer, removePlayer } from '../services/player'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { WsPeer, WsEvents } from './utils'
import type { UserData } from '#shared/interfaces/userData'

const logger = consola.withTag('WS')

export const wsEventBus = mitt<WsEvents>()

export const globalStatus = {
  peers: new Set<WsPeer>(),
  users: new Map<string, UserData & { peer: WsPeer }>(),
  channels: new Map<string, Set<WsPeer>>()
}

async function resolveUserFromPeer(peer: WsPeer) {
  try {
    const { user: sessionUser } = await getUserSession({ ...peer.request, context: peer.context })
    if (!sessionUser) return { session: null, userData: null }
    const userData = await getUserData(sessionUser.id)
    return { session: sessionUser, userData }
  } catch {
    return { session: null, userData: null }
  }
}

export function subscribePeerToChannel(peer: WsPeer, topic: string) {
  peer.topics.add(topic)
  if (!globalStatus.channels.has(topic)) globalStatus.channels.set(topic, new Set())
  globalStatus.channels.get(topic)!.add(peer)
}

export function unsubscribePeerFromChannel(peer: WsPeer, topic: string) {
  peer.topics.delete(topic)
  const set = globalStatus.channels.get(topic)
  set?.delete(peer)
  if (set && set.size === 0) globalStatus.channels.delete(topic)
}

export function removePeer(peer: WsPeer) {
  globalStatus.peers.delete(peer)
  // 从 users map 中移除（如果匹配）
  for (const [uid, u] of globalStatus.users) {
    if (u.peer.id === peer.id) {
      globalStatus.users.delete(uid)
      removePlayer(uid)
    }
  }
  // 从 channels 索引删除
  for (const [topic, set] of globalStatus.channels) {
    set.delete(peer)
    if (set.size === 0) globalStatus.channels.delete(topic)
  }
}

export const sendToAll = <T>(msg: WebsocketMessage<T>) => {
  const encoded = msg
  for (const peer of globalStatus.peers) safeSend(peer, encoded)
}

export const sendToChannel = <T>(msg: WebsocketMessage<T>, channel?: string | string[]) => {
  if (!channel) return
  const topics = Array.isArray(channel) ? channel : [channel]
  const encoded = msg
  const target = new Set<WsPeer>()

  for (const t of topics) {
    const set = globalStatus.channels.get(t)
    if (set) for (const p of set) target.add(p)
  }

  for (const p of target) safeSend(p, encoded)
}

export const sendToUser = <T>(msg: WebsocketMessage<T>, id: string | string[]) => {
  const ids = Array.isArray(id) ? id : [id]
  const encoded = msg

  for (const i of ids) {
    const user = globalStatus.users.get(i)
    if (user && isOpen(user.peer)) safeSend(user.peer, encoded)
  }
}

const hooks = defineHooks({
  async upgrade(request) {
    await requireUserSession(request)
  },

  async open(peer) {
    try {
      globalStatus.peers.add(peer)

      const { session, userData } = await resolveUserFromPeer(peer)
      if (session) {
        // 处理重复登录：关闭旧连接并替换
        const prev = globalStatus.users.get(session.id)
        if (prev) {
          safeSend(prev.peer, WS_MESSAGE_DUPLICATE_LOGIN)
          prev.peer.close(4001, 'Duplicate login')
        }
        globalStatus.users.set(session.id, { ...userData, peer })
        addPlayer({ ...userData, peer })
      }

      wsEventBus.emit('ws:connect', {
        peer,
        user: userData,
        reply: reply(peer)
      })
    } catch (e) {
      logger.error('ws open error', e)
    }
  },

  /**
   * 客户端消息处理
   * @param peer
   * @param message 原始未解码消息
   */
  async message(peer, message) {
    try {
      const msg = message.json() as WebsocketMessage<{ rid?: string }>
      if (!msg || !msg.type) return
      if (msg.type === WS_MESSAGE_PING.type) {
        safeSend(peer, WS_MESSAGE_PONG)
        return
      }

      const { userData } = await resolveUserFromPeer(peer)
      wsEventBus.emit('ws:message', {
        peer,
        msg,
        user: userData,
        // 生成回复函数，可以回复该请求
        // 回复时，若客户端携带了 rid 参数，则一并携带它进行回复（最长 36，溢出部分截取掉）
        reply: reply(peer, msg.rid?.substring(0, 36))
      })
    } catch (e) {
      logger.warn('ws message parse/handler error', e)
      try {
        reply(peer)({ type: 'error' })
      } catch {
        //
      }
    }
  },

  /**
   * 客户端连接关闭
   * @param peer
   * @param e
   */
  async close(peer, e) {
    try {
      removePeer(peer)
      const { userData } = await resolveUserFromPeer(peer)
      wsEventBus.emit('ws:disconnect', { peer, user: userData, ...e })
    } catch (e) {
      logger.warn('ws close error', e)
    }
  },

  /**
   * 客户端连接错误
   * @param peer
   * @param error
   */
  async error(peer, error) {
    try {
      removePeer(peer)
      const { userData } = await resolveUserFromPeer(peer)
      wsEventBus.emit('ws:error', { peer, user: userData, error })
    } catch (e) {
      logger.warn('ws error handler failed', e)
    }
  }
})

// 注册 handlers
handlers()

export { hooks }
