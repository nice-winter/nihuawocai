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

export type WebsocketMessage<T = {}> = BaseWebsocketMessage & T

export type WebsocketMessageType = 'ping' | 'pong' | string
