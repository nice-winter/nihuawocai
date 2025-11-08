import type { LoggedInPlayer, PlayerState } from '#shared/interfaces/player'
import type { WebsocketMessage } from '#shared/interfaces/ws'

export const usePlayerStore = defineStore('playerStore', () => {
  const { wsEventBus, send } = useWsStore()

  const player = ref<LoggedInPlayer | null>(null)

  const clear = () => {
    player.value = null
  }

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type === 'player:logged_in') {
      const { player_info } = msg as WebsocketMessage<{ player_info: LoggedInPlayer }>
      player.value = player_info
    }

    if (msg.type === 'player:state_update') {
      const { id, state, roomNumber } = msg as WebsocketMessage<PlayerState>
      if (player.value && id === player.value.id) {
        player.value.state = state
        player.value.roomNumber = roomNumber
      }
    }
  })

  wsEventBus.on('ws:disconnected', clear)
  wsEventBus.on('ws:error', clear)

  return {
    player
  }
})
