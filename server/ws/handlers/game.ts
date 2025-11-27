import { consola } from 'consola'
import { defineWsHandlers } from '~~/server/ws/utils'
import { handleGiveUp, handleGift, handleSketchpad } from '~~/server/services/game'

const logger = consola.withTag('Game Handler')

export default defineWsHandlers({
  'game:drawing:give_up': async ({ user }) => {
    return handleGiveUp(user.id)
  },
  'game:drawing:sketchpad': async ({ msg, user }) => {
    const { command, payload } = msg as WebsocketMessage<{
      command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'clear'
      payload: unknown
    }>
    const res = await handleSketchpad(user.id, command, payload)
    if (command === 'draw') return 'NON_REPONSE' // 画板坐标传输协议，不返回任何内容
    return res
  },
  'game:interaction:gift': async ({ msg, user }) => {
    const { item_type, count } = msg as WebsocketMessage<{
      item_type: 'flower' | 'egg' | 'slipper'
      count: number
    }>

    return handleGift(user.id, item_type)
  }
})
