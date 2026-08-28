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
 * 适用场景：已知具体事件类型时，获取该事件的完整消息结构
 *
 * @example
 * // 在 store 中处理已知类型的事件
 * const event = msg as ServerMessage<'game:event:start'>
 * event.payload.total_rounds // ✅ number
 *
 * @example
 * // 处理画板事件
 * const event = msg as ServerMessage<'game:event:sketchpad'>
 * event.command // 'pencil_switch' | 'draw' | ...
 * event.payload // unknown (由画板模块自行窄化)
 */
export type ServerMessage<T extends keyof ServerEventMap> = WebsocketMessage<ServerEventMap[T]>

/**
 * 服务端事件联合类型（可自动窄化）
 *
 * 适用场景：switch/case 分支中根据 msg.type 自动推导 payload 类型，无需手写 as
 *
 * @example
 * // 在 store 的 wsEventBus.on 回调中
 * wsEventBus.on('ws:message', (msg) => {
 *   const event = msg as ServerEvent
 *   switch (event.type) {
 *     case 'game:event:start':
 *       event.payload.total_rounds // ✅ 自动窄化为 number
 *       break
 *     case 'game:event:notice':
 *       event.payload.message // ✅ 自动窄化为 string
 *       break
 *   }
 * })
 */
export type ServerEvent = {
  [K in keyof ServerEventMap]: { type: K } & ServerEventMap[K]
}[keyof ServerEventMap]

/**
 * 客户端消息：根据消息类型自动推导 body
 *
 * 适用场景：构造发送给服务端的消息时，确保参数类型正确
 *
 * @example
 * const msg: ClientMessage<'game:interaction:gift'> = {
 *   type: 'game:interaction:gift',
 *   item_type: 'flower',
 *   count: 1
 * }
 */
export type ClientMessage<T extends keyof ClientEventMap> = WebsocketMessage<{ type: T } & ClientEventMap[T]>

/**
 * 客户端请求的响应类型
 *
 * 适用场景：await send() 之后，将返回值断言为具体的响应类型
 *
 * @example
 * // 拉取房间列表
 * const res = await send({ type: 'room:list_pull' }) as ClientResponse<'room:list_pull'>
 * res.room_list // ✅ RoomInfo[]
 *
 * @example
 * // 获取玩家档案
 * const res = await send({ type: 'player:get_profile', id: playerId }) as ClientResponse<'player:get_profile'>
 * res.profile // ✅ Player
 *
 * @example
 * // 邀请玩家
 * const res = await send({ type: 'room:invite', toId }) as ClientResponse<'room:invite'>
 * res.expAt // ✅ number
 */
export type ClientResponse<T extends keyof ClientResponseMap> = WS_RECV<ClientResponseMap[T]>
