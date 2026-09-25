import mitt from 'mitt'

type Events = {
  // ui
  'user:logout': unknown
  'ui:screenshot': unknown

  // sketchpad
  'sketchpad:draw': {
    points: {
      point: {
        x: number
        y: number
      }
      sequence: number
      timestamp: number
      action: 'down' | 'move' | 'up'
    }[]
  }
  'sketchpad:undo': unknown
  'sketchpad:redo': unknown
  'sketchpad:clear': unknown

  // room
  'current:room:event:player_join': {
    seat: number
    player: Player
  }
  'current:room:event:onlooker_join': {
    player: Player
  }
  'current:room:event:player_leave': {
    seat: number
    player: Player
  }
  'current:room:event:onlooker_leave': {
    player: Player
  }
  'current:room:event:onlooker_sit': {
    seat: number
    player: Player
  }
  'current:room:event:password_change': {
    locked: boolean
    password: string
  }

  // room broadcast
  'room:event:broadcast': {
    roomNumber: number
    roomId: string
    password: string
    sender: Player
    expAt: number
    timestamp: number
  }

  // chat
  'chat:event:say': {
    message: string
    sender: Player
    timestamp: number
  }

  // game base
  'game:event:settlement': {
    scores: Record<string, number>
    item_counts: Record<string, ItemCounts>
    itemUses: ItemUse[]
    seconds: number
  }
  'game:event:state': {
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
  'game:event:notice': {
    message: string
  }
  // game round
  'game:event:turn:prepare': {
    turnIndex: number
    drawer: string
    drawerPlayer: Player
    seconds: number
  }
  'game:event:drawing:start': {
    drawer: string
    drawerPlayer: Player
    seconds: number
  }
  'game:event:interaction:start': {
    drawerPlayer: Player
    bingoPlayers: Player[]
    answer?: string
    bingo_players: string[]
    seconds: number
    reason: InteractionReason
  }
  'game:event:turn:end': {
    turnIndex: number
    scores: Record<string, number>
  }
  // game 互动
  'game:event:word': {
    word: string
    category: string
  }
  'game:event:hint': {
    hintText: string
    hintIndex: number
  }
  'game:event:guess:bingo': {
    /** 猜中者玩家 ID */
    guesserId: string
    /** 猜中者（前端富化） */
    guesser: Player
    score_delta: ScoreDelta
    bingo_players: string[]
    scores: Record<string, number>
  }
  'game:event:timer:update': {
    seconds: number
    reason: string
  }
  'game:event:interaction:item': {
    /** 送道具者玩家 ID */
    senderId: string
    /** 送道具者（前端富化） */
    sender: Player
    /** 接收者玩家 ID（固定为当回合画者） */
    targetId: string
    /** 接收者（前端富化，画手可能已离场） */
    target: Player | undefined
    itemType: ItemType
    count: number
  }
  'game:event:sketchpad:draw': unknown
}

export const eventBus = mitt<Events>()

type EventKeys = keyof Events
type EventHandler<K extends EventKeys> = (payload: Events[K]) => void

/**
 * 自动管理事件订阅的组合式函数
 *
 * 在组件挂载时订阅，卸载时自动取消，避免内存泄漏。
 * 内部基于 mitt，事件类型由 Events 映射约束，编译期保证 key 和 payload 匹配。
 *
 * @param event - 事件名称（受 Events 类型约束）
 * @param handler - 事件处理函数，payload 类型自动推导
 *
 * @example
 * useEventBus('game:event:turn:prepare', ({ seconds, drawerPlayer }) => {
 *   // 秒级类型安全，无需手动 on/off
 * })
 */
export function useEventBus<K extends EventKeys>(event: K, handler: EventHandler<K>) {
  onBeforeMount(() => eventBus.on(event, handler))
  onUnmounted(() => eventBus.off(event, handler))
}
