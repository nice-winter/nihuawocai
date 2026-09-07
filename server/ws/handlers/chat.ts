import { defineWsHandlers } from '~~/server/ws/utils'
import { say } from '~~/server/services/chat'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('ChatHandler')

export default defineWsHandlers({
  'chat:say': async ({ msg, user }) => {
    const { chatmsg } = msg as WebsocketMessage<{
      chatmsg: string
    }>

    if (!chatmsg || chatmsg === '') throw new Error('发送的消息不能为空')

    return await say(user, chatmsg.substring(0, 128))
  }
})
