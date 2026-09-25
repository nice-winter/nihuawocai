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
 * 字段语义约定（全协议强制）：
 * 1. **作用域房间** —— `room:*` 事件 envelope 必带 `roomId: string`（身份键，nanoid 不可复用）
 *    与 `roomNumber: number`（用户句柄，0-999 会回收复用，仅供 UI 展示与「按号加入」入口）。
 *    **身份比较只允许用 `roomId`，禁止用 `roomNumber`。**
 * 2. **人的发起者/目标** —— Player 对象用 `sender` / `target`；id 字符串用 `senderId` / `targetId`。
 * 3. **全协议禁用 `from` / `to` 字段名**（历史遗留的一词多义已清除）。
 *
 * 添加新事件的步骤：
 * 1. 在 ServerEventMap 或 ClientEventMap 中添加条目
 * 2. 后端 handler/service 中发送/返回对应结构
 * 3. 前端 store 中用 ServerEvent 窄化或 ClientResponse 取响应
 *
 * @see shared/types/ws.ts — ServerMessage, ServerEvent, ClientResponse 等辅助类型
 */

import type { GamePhase, TurnPhase, InteractionReason, ItemType, ItemCounts, ItemUse, ScoreDelta } from './game'
import type { Player, LoggedInPlayer, PlayerState } from './player'
import type { Room, RoomSummary } from './room'

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
 * - 带 `payload` 的：游戏事件，如 `{ payload: { totalTurns } }`
 * - 不带 `payload` 的：房间/玩家事件，字段直接平铺在消息上
 *
 * 房间事件 envelope 统一携带 `roomId` + `roomNumber`（寻址用 roomId），
 * `room` 对象（若有）负责数据载荷，二者职责分离。
 *
 * @example
 * // 前端接收并自动窄化
 * const event = msg as ServerEvent
 * if (event.type === 'game:event:start') {
 *   event.payload.totalTurns // ✅
 * }
 */
export interface ServerEventMap {
  // --- 基础协议 ---
  ping: Record<string, never>
  pong: Record<string, never>
  duplicate_login: Record<string, never>

  // --- 玩家事件 ---
  'player:event:logged_in': {
    player: LoggedInPlayer
  }
  'player:event:state_update': PlayerState
  'player:event:lobby_players_add': {
    player: Player
  }
  'player:event:lobby_players_remove': {
    player: Player
  }

  // --- 房间事件（envelope 必带 roomId + roomNumber）---
  'room:event:create': {
    roomId: string
    roomNumber: number
    room: RoomSummary
  }
  'room:event:destroy': {
    roomId: string
    roomNumber: number
  }
  'room:event:info': {
    roomId: string
    roomNumber: number
    room: Room
  }
  'room:event:owner_change': {
    roomId: string
    roomNumber: number
    /** 新房主玩家 ID */
    newOwnerId: string
  }
  'room:event:playing_change': {
    roomId: string
    roomNumber: number
    isPlaying: boolean
  }
  'room:event:seat_open_change': {
    roomId: string
    roomNumber: number
    seat: number
    isOpen: boolean
  }
  'room:event:has_password_change': {
    roomId: string
    roomNumber: number
    hasPassword: boolean
  }
  'room:event:password_change': {
    roomId: string
    roomNumber: number
    password: string
    hasPassword: boolean
  }
  'room:event:player_join': {
    roomId: string
    roomNumber: number
    seat: number
    player: Player
  }
  'room:event:player_leave': {
    roomId: string
    roomNumber: number
    seat: number
    player: Player
  }
  'room:event:onlooker_join': {
    roomId: string
    roomNumber: number
    player: Player
  }
  'room:event:onlooker_leave': {
    roomId: string
    roomNumber: number
    player: Player
  }
  'room:event:onlooker_sit': {
    roomId: string
    roomNumber: number
    seat: number
    player: Player
  }
  'room:event:invite': {
    /** 邀请人 */
    sender: Player
    /** 被邀请人 */
    target: Player
    roomId: string
    roomNumber: number
    password: string
    expiresAt: number
  }
  'room:event:lobby_invite': {
    roomId: string
    roomNumber: number
    password: string
    sender: Player
    expiresAt: number
    timestamp: number
  }

  // --- 聊天事件 ---
  'chat:event:say': {
    message: string
    sender: Player
    timestamp: number
  }

  // --- 游戏核心生命周期 ---
  'game:event:start': {
    payload: {
      totalTurns: number
    }
  }
  'game:event:settlement': {
    payload: {
      scores: Record<string, number>
      item_counts: Record<string, ItemCounts>
      itemUses: ItemUse[]
      /** 结算面板展示时长 */
      displaySeconds: number
    }
  }
  'game:event:end': {
    payload: Record<string, never>
  }
  'game:event:state': {
    payload: {
      game_phase: GamePhase
      turnPhase: TurnPhase
      turnIndex: number
      totalTurns: number
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
  'game:event:turn:prepare': {
    payload: {
      turnIndex: number
      drawer: string
      /** 准备阶段总时长 */
      durationSeconds: number
    }
  }
  'game:event:drawing:start': {
    payload: {
      drawer: string
      /** 绘画阶段总时长 */
      durationSeconds: number
    }
  }
  'game:event:interaction:start': {
    payload: {
      answer?: string
      bingo_players: string[]
      /** 互动阶段总时长 */
      durationSeconds: number
      reason: InteractionReason
    }
  }
  'game:event:turn:end': {
    payload: {
      turnIndex: number
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
  'game:event:hint': {
    payload: {
      hintText: string
      /** 第几条提示（1-based） */
      hintIndex: number
    }
  }
  'game:event:guess:bingo': {
    payload: {
      /** 猜中者玩家 ID */
      guesserId: string
      score_delta: ScoreDelta
      bingo_players: string[]
      scores: Record<string, number>
    }
  }
  'game:event:timer:update': {
    payload: {
      /** 调整后的新剩余时长 */
      remainingSeconds: number
      reason: string
    }
  }
  'game:event:interaction:item': {
    payload: {
      /** 送道具者玩家 ID */
      senderId: string
      /** 接收者玩家 ID（固定为当回合画者） */
      targetId: string
      itemType: ItemType
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
 * await send({ type: 'game:interaction:item', itemType: 'flower', count: 1 })
 */
export interface ClientEventMap {
  // --- 房间操作 ---
  'room:list_pull': Record<string, never>
  'room:quick_match': Record<string, never>
  'room:create': {
    openSeatCount: number
    joinOptions: { password: string; maxOnlookers: number }
  }
  'room:join': {
    roomNumber: number
    /** 可选：邀请/广播/列表携带的房间身份 ID，服务端校验与 roomNumber 对应，防止旧引用误入同号新房 */
    roomId?: string
    password?: string | null
    /** 指定以旁观身份加入（缺省则优先入座，坐满时自动转旁观） */
    asOnlooker?: boolean
  }
  'room:leave': Record<string, never>
  'room:sit': {
    seat: number
  }
  'room:seat_open_change': {
    seat: number
    isOpen: boolean
  }
  'room:password_change': {
    password: string
  }
  'room:lobby_invite': Record<string, never>
  'room:invite': {
    /** 被邀请玩家 ID */
    targetId: string
  }
  'room:game_start': Record<string, never>

  // --- 玩家操作 ---
  'player:lobby_players_pull': Record<string, never>
  'player:get_profile': {
    playerId: string
  }

  // --- 游戏操作 ---
  'game:drawing:give_up': Record<string, never>
  'game:drawing:sketchpad': {
    command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'undo' | 'redo' | 'clear'
    payload: unknown
  }
  'game:interaction:item': {
    itemType: ItemType
    count: number
  }

  // --- 聊天 ---
  'chat:say': {
    message: string
  }
}

// ================================================================
//              Client → Server 请求-响应 (Response)
// ================================================================

/**
 * 客户端请求 → 服务端响应类型映射
 *
 * key: 请求名（与 ClientEventMap 对应）
 * value: 服务端返回的数据结构（不含 _reply/_rid/_t/_scope/successful 等传输字段，由 WS_RECV 补充）
 *
 * 工作原理：
 * 1. 客户端 send({ type }) 发起请求
 * 2. 服务端 handler 返回数据对象
 * 3. 框架自动包装为 { type, ...data, successful, _reply, _rid, _t } 回传
 * 4. 客户端用 as ClientResponse<'xxx'> 取到类型安全的响应
 *
 * 注意：handler 必须返回 object 才能携带业务字段；返回裸 number/string 会被回包机制吞掉。
 *
 * @example
 * const res = await send({ type: 'room:list_pull' }) as ClientResponse<'room:list_pull'>
 * res.rooms   // ✅ RoomSummary[]
 * res.successful  // ✅ boolean (来自 WS_RECV)
 */
export interface ClientResponseMap {
  'room:list_pull': {
    rooms: RoomSummary[]
  }
  'room:quick_match': {
    room: Room
  }
  'room:create': {
    room: Room
  }
  'room:join': {
    room: Room
  }
  'room:leave': {
    roomId: string
    roomNumber: number
  }
  'room:sit': Record<string, never>
  'room:seat_open_change': {
    roomId: string
    roomNumber: number
    seat: number
    isOpen: boolean
  }
  'room:password_change': {
    roomId: string
    roomNumber: number
    hasPassword: boolean
    password: string
  }
  'room:lobby_invite': {
    roomId: string
    roomNumber: number
    password: string
    sender: Player
    expiresAt: number
    timestamp: number
  }
  'room:invite': {
    /** 邀请人 */
    sender: Player
    /** 被邀请人 */
    target: Player
    roomId: string
    roomNumber: number
    password: string
    expiresAt: number
  }
  'room:game_start': Record<string, never>
  'player:lobby_players_pull': {
    lobbyPlayers: Player[]
  }
  'player:get_profile': {
    playerId: string
    profile: Player
  }
  'game:drawing:give_up': Record<string, never>
  'game:drawing:sketchpad': Record<string, never>
  'game:interaction:item': Record<string, never>
  'chat:say': Record<string, never>
}
