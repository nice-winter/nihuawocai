import mitt from 'mitt'
import { AdapterInternal, defineHooks, Peer } from 'crossws'
import { encode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG, WS_MESSAGE_DUPLICATE_LOGIN } from '#shared/interfaces/ws'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import { UserData } from '#shared/interfaces/userData'

type WsEvents = {
  'ws:connect': unknown
  'ws:message': WebsocketMessage
  'ws:error': unknown
  'ws:disconnect': unknown
}

const loginUsers = new Map<string, UserData & { peer: Peer<AdapterInternal> }>()

let peers: Set<Peer<AdapterInternal>>

const _removeUserByPeer = async (peer: Peer<AdapterInternal>) => {
  const { user } = await getUserSession({
    ...peer.request,
    context: peer.context
  })

  if (user && loginUsers.has(user.id)) {
    if (peer.id === loginUsers.get(user.id)?.peer.id) {
      loginUsers.delete(user.id)
    }
  }
}

const hooks = defineHooks({
  async upgrade(request) {
    await requireUserSession(request)
  },

  async open(peer) {
    if (!peers) peers = peer.peers

    const { user } = await getUserSession({
      ...peer.request,
      context: peer.context
    })

    if (user) {
      // 判断重复登录
      const uwp = loginUsers.get(user.id)
      if (uwp) {
        uwp.peer.send(encode(WS_MESSAGE_DUPLICATE_LOGIN))
        uwp.peer.close(4001, 'Duplicate login, close.')
      }

      loginUsers.set(user.id, {
        ...(await getUserData(user.id)),
        peer
      })
    }

    console.log('open', loginUsers)
  },

  message(peer, message) {
    const msg = message.json() as WebsocketMessage<{}>
    if (msg.type.toLowerCase() === WS_MESSAGE_PING.type) peer.send(encode(WS_MESSAGE_PONG))

    console.log('[ws] message', msg)
  },

  async close(peer, { code, reason }) {
    _removeUserByPeer(peer)
    console.log('close', loginUsers)
  },

  async error(peer, error) {
    _removeUserByPeer(peer)
    console.log('error', loginUsers)
  }
})

const wsEventBus = mitt<WsEvents>()

export { type WsEvents, wsEventBus, loginUsers, peers, hooks }
