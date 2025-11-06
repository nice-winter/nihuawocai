import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { UserData } from '#shared/interfaces/userData'
import type { AdapterInternal, Peer, WSError } from 'crossws'

type WsEvents = {
  'ws:connect': {
    peer: Peer<AdapterInternal>
    user: UserData
    reply: <T>(msg: WebsocketMessage<T>) => void
  }
  'ws:message': {
    peer: Peer<AdapterInternal>
    msg: WebsocketMessage
    user: UserData
    reply: <T>(msg: WebsocketMessage<T>) => void
  }
  'ws:error': {
    peer: Peer<AdapterInternal>
    user: UserData
    error: WSError
  }
  'ws:disconnect': {
    peer: Peer<AdapterInternal>
    user: UserData
    code?: number
    reason?: string
  }
}

interface WsHandlers {
  [key: string]: (e: WsEvents['ws:message']) => void | Promise<void>
}

const defineWsHandlers = (handlers: WsHandlers) => {
  return handlers
}

export { WsEvents, WsHandlers, defineWsHandlers }
