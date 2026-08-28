export const useChatStore = defineStore('chat', () => {
  const { wsEventBus, send } = useWsStore()

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type === 'chat:event:say') {
      const event = msg as ServerMessage<'chat:event:say'>

      eventBus.emit('chat:event:say', {
        chatmsg: event.chatmsg,
        sender: event.sender,
        timestamp: event.timestamp
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
