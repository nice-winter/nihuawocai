export default defineWebSocketHandler({
  async upgrade(request) {
    // Make sure the user is authenticated before upgrading the WebSocket connection
    await requireUserSession(request)
  },
  open(peer) {
    console.log('[ws] open', peer)
  },

  message(peer, message) {
    console.log('[ws] message', peer, message)
    if (message.text().includes('ping')) {
      peer.send('pong')
    }
  },

  close(peer, event) {
    console.log('[ws] close', peer, event)
  },

  error(peer, error) {
    console.log('[ws] error', peer, error)
  }
})
