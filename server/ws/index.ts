import mitt from 'mitt'
import { AdapterInternal, defineHooks, Peer } from 'crossws'
import { encode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG, WS_MESSAGE_DUPLICATE_LOGIN } from '#shared/interfaces/ws'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import { UserData } from '#shared/interfaces/userData'
import { handleMessage } from './router'

type WsEvents = {
  'ws:connect': Peer<AdapterInternal>
  'ws:message': {
    peer: Peer<AdapterInternal>
    msg: WebsocketMessage
    user: UserData
    reply: <T>(msg: WebsocketMessage<T>) => void
  }
  'ws:error': Peer<AdapterInternal>
  'ws:disconnect': Peer<AdapterInternal>
}

const wsEventBus = mitt<WsEvents>()
let peers: Set<Peer<AdapterInternal>>
const loginUsers = new Map<string, UserData & { peer: Peer<AdapterInternal> }>()

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

// crossws 钩子
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

    wsEventBus.emit('ws:connect', peer)
  },

  async message(peer, message) {
    const msg = message.json() as WebsocketMessage<{}>
    if (msg.type.toLowerCase() === WS_MESSAGE_PING.type) peer.send(encode(WS_MESSAGE_PONG))

    const { user } = await getUserSession({
      ...peer.request,
      context: peer.context
    })

    console.log('[ws] message', msg)

    wsEventBus.emit('ws:message', {
      peer,
      msg,
      user: await getUserData(user?.id || ''),
      reply: (msg: WebsocketMessage) => {
        peer.send(
          encode({
            ...msg,
            _t: Date.now(),
            _reply: true
          })
        )
      }
    })
  },

  async close(peer, { code, reason }) {
    _removeUserByPeer(peer)
    console.log('close', loginUsers)

    wsEventBus.emit('ws:disconnect', peer)
  },

  async error(peer, error) {
    _removeUserByPeer(peer)
    console.log('error', loginUsers)

    wsEventBus.emit('ws:error', peer)
  }
})

const sendToAll = (msg: WebsocketMessage) => {
  const encodedMsg = encode(msg)
  peers.forEach((peer) => peer.send(encodedMsg))
}

const sendToChannel = (msg: WebsocketMessage, channel?: string | string[]) => {
  const encoded = encode(msg)
  if (!channel) return

  const channels = Array.isArray(channel) ? channel : [channel]
  const targetPeers = new Set<Peer<AdapterInternal>>()

  for (const peer of peers) {
    for (const c of channels) {
      if (peer.topics.has(c)) {
        targetPeers.add(peer)
        break
      }
    }
  }

  for (const peer of targetPeers) {
    peer.send(encoded)
  }
}

const sendToUser = (msg: WebsocketMessage, id: string | string[]) => {
  const ids = Array.isArray(id) ? id : [id]
  const encodedMsg = encode(msg)

  ids.forEach((i) => {
    const user = loginUsers.get(i)
    if (user && user.peer.websocket.readyState === 1) {
      user.peer.send(encodedMsg)
    }
  })
}

handleMessage()

export { type WsEvents, wsEventBus, loginUsers, peers, hooks, sendToAll, sendToChannel, sendToUser }
