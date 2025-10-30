import mitt from 'mitt'

type Events = {
  'sketchpad:undo': unknown
  'sketchpad:redo': unknown
  'sketchpad:clear': unknown
}

export const eventBus = mitt<Events>()
