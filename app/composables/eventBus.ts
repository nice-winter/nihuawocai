import mitt from 'mitt'
import type { Player } from '#shared/interfaces/player'

type Events = {
  'user:logout': unknown
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
}

export const eventBus = mitt<Events>()

type EventKeys = keyof Events
type EventHandler<K extends EventKeys> = (payload: Events[K]) => void

export function useEventBus<K extends EventKeys>(event: K, handler: EventHandler<K>) {
  onBeforeMount(() => eventBus.on(event, handler))
  onUnmounted(() => eventBus.off(event, handler))
}
