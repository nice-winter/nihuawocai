import { defineWsHandlers } from '~~/server/ws/utils'
import { handleGiveUp, handleItem, handleSketchpad } from '~~/server/services/game'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('GameHandler')

export default defineWsHandlers({
  'game:drawing:give_up': async ({ user }) => {
    return handleGiveUp(user.id)
  },
  'game:drawing:sketchpad': async ({ msg, user }) => {
    const { command, payload } = msg as WebsocketMessage<{
      command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'undo' | 'redo' | 'clear'
      payload: unknown
    }>
    const res = await handleSketchpad(user.id, command, payload)
    if (command === 'draw') return NON_RESPONSE // 画板坐标传输协议，不返回任何内容
    return res
  },
  'game:interaction:item': async ({ msg, user }) => {
    const { itemType } = msg as WebsocketMessage<{
      itemType: ItemType
      count: number
    }>

    return handleItem(user.id, itemType)
  }
})
