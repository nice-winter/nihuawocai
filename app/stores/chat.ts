export const useChatStore = defineStore('chat', () => {
  const { wsEventBus, send } = useWsStore()

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type === 'chat:event:say') {
      const { chatmsg, sender, timestamp } = msg as WebsocketMessage<{
        chatmsg: string
        sender: Player
        timestamp: number
      }>

      eventBus.emit('chat:event:say', {
        chatmsg,
        sender,
        timestamp
      })
    }
  })

  const say = (chatmsg: string) => {
    const msg = {
      type: 'chat:say',
      chatmsg: chatmsg
    }

    send(msg)
  }

  return {
    say
  }
})
