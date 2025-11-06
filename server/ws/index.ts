import mitt from 'mitt'
import type { AdapterInternal, Peer } from 'crossws'
import { defineHooks } from 'crossws'
import { encode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG, WS_MESSAGE_DUPLICATE_LOGIN } from '#shared/interfaces/ws'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { UserData } from '#shared/interfaces/userData'
import router from './router'
import { getUserData } from '~~/server/services/user'
import type { WsEvents } from './utils/index'

const wsEventBus = mitt<WsEvents>()

const globalStatus = {
  peers: new Set<Peer<AdapterInternal>>(),
  users: new Map<string, UserData & { peer: Peer<AdapterInternal> }>()
}

const _removeUserByPeer = async (peer: Peer<AdapterInternal>) => {
  const { user } = await getUserSession({
    ...peer.request,
    context: peer.context
  })

  if (user && globalStatus.users.has(user.id)) {
    if (peer.id === globalStatus.users.get(user.id)?.peer.id) {
      globalStatus.users.delete(user.id)
    }
  }
}

// crossws 钩子
const hooks = defineHooks({
  async upgrade(request) {
    await requireUserSession(request)
  },

  async open(peer) {
    if (!globalStatus.peers) globalStatus.peers = peer.peers

    const { user } = await getUserSession({
      ...peer.request,
      context: peer.context
    })

    if (user) {
      // 判断重复登录
      const uwp = globalStatus.users.get(user.id)
      if (uwp) {
        uwp.peer.send(encode(WS_MESSAGE_DUPLICATE_LOGIN))
        uwp.peer.close(4001, 'Duplicate login, close.')
      }

      globalStatus.users.set(user.id, {
        ...(await getUserData(user.id)),
        peer
      })
    }

    console.log('open', globalStatus.users)

    wsEventBus.emit('ws:connect', {
      peer,
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

  async message(peer, message) {
    const msg = message.json() as WebsocketMessage<object>
    if (msg.type.toLowerCase() === WS_MESSAGE_PING.type) peer.send(encode(WS_MESSAGE_PONG))

    const { user } = await getUserSession({
      ...peer.request,
      context: peer.context
    })

    console.log('[ws] --->>>>', msg)

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

  async close(peer, e) {
    _removeUserByPeer(peer)
    console.log('close', globalStatus.users)

    const { user } = await getUserSession({
      ...peer.request,
      context: peer.context
    })

    wsEventBus.emit('ws:disconnect', {
      peer,
      user: await getUserData(user?.id || ''),
      ...e
    })
  },

  async error(peer, error) {
    _removeUserByPeer(peer)
    console.log('error', globalStatus.users)

    const { user } = await getUserSession({
      ...peer.request,
      context: peer.context
    })

    wsEventBus.emit('ws:error', {
      peer,
      user: await getUserData(user?.id || ''),
      error
    })
  }
})

const sendToAll = (msg: WebsocketMessage) => {
  const encodedMsg = encode(msg)
  globalStatus.peers.forEach((peer) => peer.send(encodedMsg))
}

const sendToChannel = (msg: WebsocketMessage, channel?: string | string[]) => {
  const encoded = encode(msg)
  if (!channel) return

  const channels = Array.isArray(channel) ? channel : [channel]
  const targetPeers = new Set<Peer<AdapterInternal>>()

  for (const peer of globalStatus.peers) {
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
    const user = globalStatus.users.get(i)
    if (user && user.peer.websocket.readyState === 1) {
      user.peer.send(encodedMsg)
    }
  })
}

router()

export { type WsEvents, wsEventBus, globalStatus, hooks, sendToAll, sendToChannel, sendToUser }
