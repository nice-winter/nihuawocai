import { consola } from 'consola'
import { defineWsHandlers } from '~~/server/ws/utils'
import { say } from '~~/server/services/chat'
import type { WebsocketMessage } from '#shared/interfaces/ws'

const logger = consola.withTag('Chat Handler')

export default defineWsHandlers({
  'chat:say': async ({ msg, user }) => {
    const { chatmsg } = msg as WebsocketMessage<{
      chatmsg: string
    }>

    if (!chatmsg || chatmsg === '') throw new Error('发送的消息不能为空')

    return await say(user, chatmsg.substring(0, 128))
  }
})
