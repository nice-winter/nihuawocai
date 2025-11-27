export interface BaseWebsocketMessage {
  type: WebsocketMessageType
  // status: 'success' | 'error' | 'pending'
  // timestamp: number
  // version?: string
  // id?: string
}

export const WS_MESSAGE_PING: WebsocketMessage = {
  type: 'ping'
}

export const WS_MESSAGE_PONG: WebsocketMessage = {
  type: 'pong'
}

export const WS_MESSAGE_DUPLICATE_LOGIN: WebsocketMessage = {
  type: 'duplicate_login'
}

export type WebsocketMessage<T = object> = BaseWebsocketMessage & T

export type WS_RECV<T = object> = WebsocketMessage<{
  _reply: boolean
  _rid: string
  _t: number
  successful?: boolean
}> &
  T

export type WebsocketMessageType = 'ping' | 'pong' | string

export const NON_REPONSE = 'NON_REPONSE'
