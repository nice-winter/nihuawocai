/**
 * WebSocket 事件协议映射
 *
 * 约定：
 * - ServerEventMap: 服务端 → 客户端的事件（不含 `type` 和 `from`，由框架补充）
 * - ClientEventMap: 客户端 → 服务端的消息体（不含 `type`，由框架补充）
 *
 * 使用方式：
 *   import type { ServerMessage, ServerEvent } from '~~/shared/types/ws'
 *   const msg: ServerEvent = ...
 *   if (msg.type === 'game:event:start') msg.payload.total_rounds // ✅ 自动窄化
 */

import type { GamePhase, RoundPhase, InteractionReason, ItemType, ItemCounts, GiftRecord, ScoreDelta } from './game'
import type { Player, LoggedInPlayer, PlayerState } from './player'
import type { Room, RoomInfo } from './room'

// ================================================================
//                     Server → Client 事件
// ================================================================

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

/** 客户端请求 → 服务端响应的类型映射 */
export interface ClientResponseMap {
  'room:list_pull': {
    room_list: RoomInfo[]
  }
  'player:lobby_players_pull': {
    lobby_players: Player[]
  }
}
