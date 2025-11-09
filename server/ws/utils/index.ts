import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { UserData } from '#shared/interfaces/userData'
import type { AdapterInternal, Peer, WSError } from 'crossws'

type WsPeer = Peer<AdapterInternal>

type WsEvents = {
  'ws:connect': {
    peer: Peer<AdapterInternal>
    user: UserData | null
    reply: <T>(msg: WebsocketMessage<T>) => void
  }
  'ws:message': {
    peer: Peer<AdapterInternal>
    msg: WebsocketMessage
    user: UserData | null
    reply: <T>(msg: WebsocketMessage<T>) => void
  }
  'ws:error': {
    peer: Peer<AdapterInternal>
    user: UserData | null
    error: WSError
  }
  'ws:disconnect': {
    peer: Peer<AdapterInternal>
    user: UserData | null
    code?: number
    reason?: string
  }
}

interface WsHandlers {
  [key: string]: (e: WsEvents['ws:message']) => void | Promise<void>
}

const isOpen = (peer: WsPeer) => peer.websocket && peer.websocket.readyState === 1

const safeSend = <T>(peer: WsPeer, msg: WebsocketMessage<T>) => {
  const encoded = encode({
    ...msg,
    ...(msg.type.toLowerCase() !== 'pong' ? { _t: Date.now() } : {})
  })
  if (isOpen(peer)) {
    try {
      peer.send(encoded)
    } catch (e) {
      console.warn('[ws]', 'safeSend failed', e)
    }
  }
}

const reply =
  (peer: WsPeer, rid?: string) =>
  <T>(msg: WebsocketMessage<T>) => {
    safeSend(peer, { ...msg, _reply: true, _rid: rid })
  }

const defineWsHandlers = (handlers: WsHandlers) => {
  return handlers
}

export { type WsPeer, type WsEvents, type WsHandlers, isOpen, safeSend, reply, defineWsHandlers }
