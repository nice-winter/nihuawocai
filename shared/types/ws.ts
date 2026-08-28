import type { ServerEventMap, ClientEventMap, ClientResponseMap } from './protocol'

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

// ----------------------------------------------------------------
//           共享协议辅助类型 (Server ↔ Client)
// ----------------------------------------------------------------

/**
 * 服务端事件消息：根据事件类型自动推导 payload
 *
 * @example
 * const msg: ServerMessage<'game:event:start'> = ...
 * msg.payload.total_rounds // ✅ number
 */
export type ServerMessage<T extends keyof ServerEventMap> = WebsocketMessage<ServerEventMap[T]>

/**
 * 服务端事件联合类型（可自动窄化）
 *
 * @example
 * const msg: ServerEvent = ...
 * switch (msg.type) {
 *   case 'game:event:start':
 *     msg.payload.total_rounds // ✅ 自动窄化
 * }
 */
export type ServerEvent = {
  [K in keyof ServerEventMap]: { type: K } & ServerEventMap[K]
}[keyof ServerEventMap]

/**
 * 客户端消息：根据消息类型自动推导 body
 *
 * @example
 * const msg: ClientMessage<'game:interaction:gift'> = { type: 'game:interaction:gift', item_type: 'flower', count: 1 }
 */
export type ClientMessage<T extends keyof ClientEventMap> = WebsocketMessage<{ type: T } & ClientEventMap[T]>

/**
 * 客户端请求的响应类型
 *
 * @example
 * const res = await send({ type: 'room:list_pull' }) as ClientResponse<'room:list_pull'>
 * res.room_list // ✅ RoomInfo[]
 */
export type ClientResponse<T extends keyof ClientResponseMap> = WS_RECV<ClientResponseMap[T]>
