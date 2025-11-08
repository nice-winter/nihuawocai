import { consola } from 'consola'
import { colors } from 'consola/utils'
import { wsEventBus } from '.'
import roomListHandler from './handlers/room'
import type { WsHandlers } from './utils'

const logger = consola.withTag('Handlers')

function registerHandlers(handlers: WsHandlers) {
  wsEventBus.on('ws:message', async (e) => {
    const handler = handlers[e.msg.type]
    if (handler) {
      try {
        await handler(e)
      } catch (err) {
        e.reply({ type: e.msg.type, message: String(err), _error: true })
      }
    }
  })

  logger.debug(
    `Registered ${colors.cyan(Object.keys(handlers).length)} handlers:`,
    Object.keys(handlers)
      .map((k) => colors.cyan(k))
      .join(', ')
  )
}

export default function () {
  registerHandlers({
    ...roomListHandler
  })
}
