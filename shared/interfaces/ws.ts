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

export type WebsocketMessageType = 'ping' | 'pong' | string
