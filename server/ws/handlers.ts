import { consola } from 'consola'
import { colors } from 'consola/utils'
import { wsEventBus } from '.'
import roomListHandler from './handlers/room'
import type { WsHandlers } from './utils'

const logger = consola.withTag('Handlers')

let INITIALIZED = false

function registerHandlers(handlers: WsHandlers) {
  if (INITIALIZED) return

  wsEventBus.on('ws:message', async (e) => {
    const handler = handlers[e.msg.type.toLowerCase()]
    if (handler) {
      logger.debug(
        'Trigger:',
        colors.cyan(e.msg.type),
        'From:',
        `${colors.cyan(e.user?.nickname || '')}@${colors.gray(e.user?.id || '')}`
      )

      try {
        await handler(e)
      } catch (err) {
        e.reply({ type: e.msg.type, message: String(err), _error: true })
      }
    }
  })

  INITIALIZED = true

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
