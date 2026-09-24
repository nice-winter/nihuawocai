export const useChatStore = defineStore('chat', () => {
  const { wsEventBus, send } = useWsStore()

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type === 'chat:event:say') {
      const event = msg as ServerMessage<'chat:event:say'>

      eventBus.emit('chat:event:say', {
        message: event.message,
        sender: event.sender,
        timestamp: event.timestamp
      })
    }
  })

  const say = (message: string) => {
    const msg = {
      type: 'chat:say',
      message
    }

    send(msg)
  }

  return {
    say
  }
})
