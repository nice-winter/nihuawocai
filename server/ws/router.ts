import { wsEventBus } from '.'
import type { WsHandlers } from './utils'
import roomListHandler from './handlers/room-list'

function registerHandlers(handlers: WsHandlers) {
  wsEventBus.on('ws:message', async (e) => {
    const handler = handlers[e.msg.type]
    if (handler) {
      try {
        await handler(e)
      } catch (err) {
        // e.reply({ type: 'error', message: String(err) })
      }
    }
  })

  console.log(
    '[ws-router]',
    `注册了 ${Object.keys(handlers).length} 个 Handlers:`,
    Object.keys(handlers).join(', ')
  )
}

export default function () {
  registerHandlers({
    ...roomListHandler
  })
}
