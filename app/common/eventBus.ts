import mitt from 'mitt'

type Events = {
  'user:logout': unknown
  'sketchpad:undo': unknown
  'sketchpad:redo': unknown
  'sketchpad:clear': unknown
}

export const eventBus = mitt<Events>()

type EventKeys = keyof Events
type EventHandler<K extends EventKeys> = (payload: Events[K]) => void

export function useEventBus<K extends EventKeys>(event: K, handler: EventHandler<K>) {
  onMounted(() => eventBus.on(event, handler))
  onUnmounted(() => eventBus.off(event, handler))
}
