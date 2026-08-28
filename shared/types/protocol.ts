/**
 * WebSocket 事件协议映射
 *
 * 本文件定义了前后端 WebSocket 通信的完整类型契约，是唯一的类型来源。
 *
 * 三个核心映射：
 * - ServerEventMap:  服务端 → 客户端的事件推送（广播/定向）
 * - ClientEventMap:  客户端 → 服务端的请求消息体
 * - ClientResponseMap: 客户端请求 → 服务端响应的类型映射
 *
 * 约定：
 * - 所有 key 使用 `模块:动作:子动作` 命名（如 `game:event:start`）
 * - ServerEventMap 的 value 不含 `type` 字段，由消息框架自动附加
 * - ClientEventMap 的 value 不含 `type` 字段，由 send() 调用时附加
 *
 * 添加新事件的步骤：
 * 1. 在 ServerEventMap 或 ClientEventMap 中添加条目
 * 2. 后端 handler/service 中发送/返回对应结构
 * 3. 前端 store 中用 ServerEvent 窄化或 ClientResponse 取响应
 *
 * @see shared/types/ws.ts — ServerMessage, ServerEvent, ClientResponse 等辅助类型
 */

import type { GamePhase, RoundPhase, InteractionReason, ItemType, ItemCounts, GiftRecord, ScoreDelta } from './game'
import type { Player, LoggedInPlayer, PlayerState } from './player'
import type { Room, RoomInfo } from './room'

// ================================================================
//                     Server → Client 事件
// ================================================================

/**
 * 服务端推送事件映射
 *
 * key: 事件名（`模块:event:动作` 格式）
 * value: 事件携带的数据结构（不含 type，由框架补充）
 *
 * 两种数据结构约定：
 * - 带 `payload` 的：游戏事件，如 `{ payload: { total_rounds } }`
 * - 不带 `payload` 的：房间/玩家事件，字段直接平铺在消息上，如 `{ from, room, seat, player }`
 *
 * @example
 * // 前端接收并自动窄化
 * const event = msg as ServerEvent
 * if (event.type === 'game:event:start') {
 *   event.payload.total_rounds // ✅
 * }
 */
export interface ServerEventMap {
  // --- 基础协议 ---
  ping: Record<string, never>
  pong: Record<string, never>
  duplicate_login: Record<string, never>

  // --- 玩家事件 ---
  'player:event:logged_in': {
    player_info: LoggedInPlayer
  }
  'player:event:state_update': PlayerState
  'player:event:lobby_players_add': {
    player: Player
  }
  'player:event:lobby_players_remove': {
    player: Player
  }

  // --- 房间事件 ---
  'room:event:create': {
    room: RoomInfo
    from: number
  }
  'room:event:destroy': {
    roomNumber: number
  }
  'room:event:info': {
    room: Room
  }
  'room:event:owner_change': {
    from: number
    id: string
  }
  'room:event:stage_update': {
    from: number
    playing: boolean
  }
  'room:event:seat_switch': {
    from: number
    seat: number
    open: boolean
  }
  'room:event:locked_state_change': {
    from: number
    locked: boolean
  }
  'room:event:password_change': {
    roomNumber: number
    password: string
    locked: boolean
  }
  'room:event:player_join': {
    from: number
    seat: number
    player: Player
  }
  'room:event:player_leave': {
    from: number
    seat: number
    player: Player
  }
  'room:event:onlooker_join': {
    from: number
    id: string
    player: Player
  }
  'room:event:onlooker_leave': {
    from: number
    id: string
    player: Player
  }
  'room:event:onlooker_sit': {
    from: number
    seat: number
    player: Player
  }
  'room:event:invite': {
    from: Player
    to: Player
    roomNumber: number
    password: string
    duration: number
    expAt: number
  }
  'room:event:broadcast': {
    from: number
    roomNumber: number
    password: string
    sender: Player
    expAt: number
    timestamp: number
  }

  // --- 聊天事件 ---
  'chat:event:say': {
    chatmsg: string
    sender: Player
    timestamp: number
  }

  // --- 游戏核心生命周期 ---
  'game:event:start': {
    payload: {
      total_rounds: number
    }
  }
  'game:event:settlement': {
    payload: {
      scores: Record<string, number>
      item_counts: Record<string, ItemCounts>
      gift_history: GiftRecord[]
      seconds: number
    }
  }
  'game:event:end': {
    payload: Record<string, never>
  }
  'game:event:state': {
    payload: {
      game_phase: GamePhase
      round_phase: RoundPhase
      round_index: number
      total_rounds: number
      drawer: string | null
      remaining_seconds: number
      bingo_players: string[]
      scores: Record<string, number>
      item_counts: Record<string, ItemCounts>
    }
  }
  'game:event:notice': {
    payload: {
      message: string
    }
  }

  // --- 回合流程控制 ---
  'game:event:round:prepare': {
    payload: {
      round_index: number
      drawer: string
      seconds: number
    }
  }
  'game:event:drawing:start': {
    payload: {
      drawer: string
      seconds: number
    }
  }
  'game:event:interaction:start': {
    payload: {
      answer?: string
      bingo_players: string[]
      seconds: number
      reason: InteractionReason
    }
  }
  'game:event:round:end': {
    payload: {
      round: number
      scores: Record<string, number>
    }
  }

  // --- 游戏流程互动 ---
  'game:event:word': {
    payload: {
      word: string
      category: string
    }
  }
  'game:event:prompt': {
    payload: {
      content: string
      index: number
    }
  }
  'game:event:guess:bingo': {
    payload: {
      id: string
      score_delta: ScoreDelta
      bingo_players: string[]
      scores: Record<string, number>
    }
  }
  'game:event:timer:update': {
    payload: {
      seconds: number
      reason: string
    }
  }
  'game:event:interaction:gift': {
    payload: {
      from: string
      to: string
      item_type: ItemType
      count: number
    }
  }

  // --- 画板事件 ---
  'game:event:sketchpad': {
    command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'undo' | 'redo' | 'clear'
    payload: unknown
  }
}

// ================================================================
//                     Client → Server 消息
// ================================================================

/**
 * 客户端发送消息映射
 *
 * key: 消息名（`模块:动作` 格式，不带 `event`）
 * value: 消息体结构（不含 type，由 send() 调用时附加）
 *
 * @example
 * await send({ type: 'room:join', roomNumber: 1234, password: 'xxx' })
 * await send({ type: 'game:interaction:gift', item_type: 'flower', count: 1 })
 */
export interface ClientEventMap {
  // --- 房间操作 ---
  'room:create': {
    opens: number
    options: { password: string; maxOnlookers: number }
  }
  'room:join': {
    roomNumber: number
    password: string
    look?: boolean
  }
  'room:leave': Record<string, never>

  // --- 游戏操作 ---
  'game:drawing:give_up': Record<string, never>
  'game:drawing:sketchpad': {
    command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'undo' | 'redo' | 'clear'
    payload: unknown
  }
  'game:interaction:gift': {
    item_type: ItemType
    count: number
  }

  // --- 聊天 ---
  'chat:say': {
    chatmsg: string
  }
}

// ================================================================
//              Client → Server 请求-响应 (Response)
// ================================================================

/**
 * 客户端请求 → 服务端响应类型映射
 *
 * key: 请求名（与 ClientEventMap 对应）
 * value: 服务端返回的数据结构（不含 _reply/_rid/_t/successful 等传输字段，由 WS_RECV 补充）
 *
 * 工作原理：
 * 1. 客户端 send({ type }) 发起请求
 * 2. 服务端 handler 返回数据对象
 * 3. 框架自动包装为 { type, ...data, successful, _reply, _rid, _t } 回传
 * 4. 客户端用 as ClientResponse<'xxx'> 取到类型安全的响应
 *
 * @example
 * const res = await send({ type: 'room:list_pull' }) as ClientResponse<'room:list_pull'>
 * res.room_list   // ✅ RoomInfo[]
 * res.successful  // ✅ boolean (来自 WS_RECV)
 */
export interface ClientResponseMap {
  'room:list_pull': {
    room_list: RoomInfo[]
  }
  'room:invite': {
    from: Player
    to: Player
    roomNumber: number
    password: string
    duration: number
    expAt: number
  }
  'player:lobby_players_pull': {
    lobby_players: Player[]
  }
  'player:get_profile': {
    id: string
    profile: Player
  }
}
