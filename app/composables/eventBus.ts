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
    from: number
    roomNumber: number
    password: string
    sender: Player
    expAt: number
    timestamp: number
  }

  // chat
  'chat:event:say': {
    chatmsg: string
    sender: Player
    timestamp: number
  }

  // game base
  'game:event:settlement': {
    scores: Record<string, number>
    item_counts: Record<string, ItemCounts>
    gift_history: GiftRecord[]
    seconds: number
  }
  'game:event:state': {
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
  'game:event:notice': {
    message: string
  }
  // game round
  'game:event:round:prepare': {
    round_index: number
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
  'game:event:round:end': {
    round: number
    scores: Record<string, number>
  }
  // game 互动
  'game:event:word': {
    word: string
    category: string
  }
  'game:event:prompt': {
    content: string
    index: number
  }
  'game:event:guess:bingo': {
    id: string
    player: Player
    score_delta: ScoreDelta
    bingo_players: string[]
    scores: Record<string, number>
  }
  'game:event:timer:update': {
    seconds: number
    reason: string
  }
  'game:event:interaction:gift': {
    from: string
    fromPlayer: Player
    to: string
    item_type: ItemType
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
 * useEventBus('game:event:round:prepare', ({ seconds, drawerPlayer }) => {
 *   // 秒级类型安全，无需手动 on/off
 * })
 */
export function useEventBus<K extends EventKeys>(event: K, handler: EventHandler<K>) {
  onBeforeMount(() => eventBus.on(event, handler))
  onUnmounted(() => eventBus.off(event, handler))
}
