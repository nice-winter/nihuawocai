import { consola } from 'consola'
// import { colors } from 'consola/utils'
import { defineHooks } from 'crossws'
import { wsEventBus } from './core/events'
import { resolveUserFromPeer } from './core/connection'
import { safeSend, reply } from './utils'
import handlers from './handlers'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG } from '#shared/interfaces/ws'
import type { WebsocketMessage } from '#shared/interfaces/ws'

const logger = consola.withTag('WS')

export const hooks = defineHooks({
  async upgrade(request) {
    await requireUserSession(request)
  },

  async open(peer) {
    const { session, userData } = await resolveUserFromPeer(peer)
    if (!session || !userData) return
    wsEventBus.emit('ws:connect', { peer, user: userData, reply: reply(peer) })
  },

  async message(peer, message) {
    try {
      const msg = message.json() as WebsocketMessage<{ rid?: string }>
      if (!msg || !msg.type) return

      if (msg.type === WS_MESSAGE_PING.type) {
        safeSend(peer, WS_MESSAGE_PONG)
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
      logger.warn('ws message error', e)
      reply(peer)({ type: 'error', message: 'Invalid message' })
    }
  },

  async close(peer, e) {
    const { userData } = await resolveUserFromPeer(peer)
    wsEventBus.emit('ws:disconnect', { peer, user: userData, ...e })
  },

  async error(peer, error) {
    const { userData } = await resolveUserFromPeer(peer)
    wsEventBus.emit('ws:error', { peer, user: userData, error })
  }
})

handlers()

export { wsEventBus }
