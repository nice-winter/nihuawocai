import mitt from 'mitt'
import type { Player } from '#shared/interfaces/player'

type Events = {
  // ui
  'user:logout': unknown
  'ui:screenshot': unknown

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
    game_phase: GameState['gamePhase']
    round_phase: GameState['roundPhase']
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
    reason: 'give_up' | 'bingo_all' | 'timeout' | 'afk' | 'force' | 'leave'
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
    score_delta: {
      drawerId: string
      drawerGain: number
      guesserId: string
      guesserGain: number
    }
    bingo_players: string[]
    scores: Record<string, number>
  }
  'game:event:timer:update': {
    seconds: number
    reason: string
  }
  'game:event:gift': {
    from: string
    fromPlayer: Player
    to: string
    item_type: 'flower' | 'egg' | 'slipper'
    count: number
  }
  'game:event:sketchpad:draw': unknown
}

export const eventBus = mitt<Events>()

type EventKeys = keyof Events
type EventHandler<K extends EventKeys> = (payload: Events[K]) => void

export function useEventBus<K extends EventKeys>(event: K, handler: EventHandler<K>) {
  onBeforeMount(() => eventBus.on(event, handler))
  onUnmounted(() => eventBus.off(event, handler))
}
