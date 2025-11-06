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

const safeSend = (peer: WsPeer, encoded: ArrayBuffer | string) => {
  if (isOpen(peer)) {
    try {
      peer.send(encoded)
    } catch (e) {
      console.warn('[ws]', 'safeSend failed', e)
    }
  }
}

const reply = (peer: WsPeer) => (msg: WebsocketMessage) => {
  safeSend(peer, encode({ ...msg, _t: Date.now(), _reply: true }))
}

const defineWsHandlers = (handlers: WsHandlers) => {
  return handlers
}

export { type WsPeer, type WsEvents, type WsHandlers, isOpen, safeSend, reply, defineWsHandlers }
