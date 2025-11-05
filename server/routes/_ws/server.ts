import { encode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG } from '#shared/interfaces/ws'
import type { WebsocketMessage } from '#shared/interfaces/ws'

export default defineWebSocketHandler({
  async upgrade(request) {
    // Make sure the user is authenticated before upgrading the WebSocket connection
    await requireUserSession(request)
  },
  open(peer) {
    // console.log('[ws] open', peer)
  },

  message(peer, message) {
    const msg = message.json() as WebsocketMessage<{}>
    if (msg.type.toLowerCase() === WS_MESSAGE_PING.type) peer.send(encode(WS_MESSAGE_PONG))

    console.log('[ws] message', msg)
  },

  close(peer, event) {
    // console.log('[ws] close', peer, event)
  },

  error(peer, error) {
    // console.log('[ws] error', peer, error)
  }
})
