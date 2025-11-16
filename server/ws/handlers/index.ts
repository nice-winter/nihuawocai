import { consola } from 'consola'
import { colors } from 'consola/utils'
import { wsEventBus } from '~~/server/ws/core/events'
import playerHandler from './player'
import roomHandler from './room'
import chatHandler from './chat'
import type { WsHandlers } from '~~/server/ws/utils'

const logger = consola.withTag('Handlers')

let INITIALIZED = false

function registerHandlers(handlers: WsHandlers) {
  if (INITIALIZED) return

  wsEventBus.on('ws:message', async (e) => {
    const type = e.msg.type?.toLowerCase?.()
    const handler = handlers[type]
    if (!type || !handler) return // 没有 handler，不处理

    logger.debug(
      'Trigger:',
      colors.cyan(type),
      'From:',
      `${colors.cyan(e.user?.nickname || '')}@${e.user?.id}`
    )

    const replyBase = { type }

    try {
      const result = await handler(e)

      if (result === undefined) {
        e.reply({ ...replyBase, successful: true }) // handler 没有返回任何内容
      } else if (typeof result === 'string') {
        e.reply({ ...replyBase, message: result, successful: true })
      } else if (typeof result === 'object') {
        e.reply({ ...replyBase, ...result, successful: true })
      } else {
        e.reply({ ...replyBase, successful: true })
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || String(err)
      e.reply({ ...replyBase, successful: false, message: errorMsg })

      logger.error(colors.red(`[${type}] Error:`), errorMsg)
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
    ...playerHandler,
    ...roomHandler,
    ...chatHandler
  })
}
