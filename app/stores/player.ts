import type { LoggedInPlayer, Player, PlayerState } from '#shared/interfaces/player'
import type { WebsocketMessage } from '#shared/interfaces/ws'

export const usePlayerStore = defineStore('playerStore', () => {
  const { wsEventBus, send } = useWsStore()
  // const { pullRoomList } = useRoomStore()

  const player = ref<LoggedInPlayer | null>(null)
  const lobbyPlayers = reactive<Map<string, Player>>(new Map())

  const clear = () => {
    player.value = null
  }

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type === 'player:event:logged_in') {
      const { player_info } = msg as WebsocketMessage<{ player_info: LoggedInPlayer }>
      player.value = player_info
      // 登录后拉取房间列表
      // pullRoomList()
    }

    if (msg.type === 'player:event:state_update') {
      const { id, state, roomNumber } = msg as WebsocketMessage<PlayerState>
      if (player.value && id === player.value.id) {
        player.value.state = state
        player.value.roomNumber = roomNumber
      }
    }

    // 大厅空闲玩家相关
    if (msg.type === 'player:lobby_players_pull') {
      const { lobby_players } = msg as WebsocketMessage<{ lobby_players: Player[] }>
      lobbyPlayers.clear()
      lobby_players.forEach((p) => lobbyPlayers.set(p.id, p))
    }

    if (msg.type === 'player:lobby_players_add') {
      const { player } = msg as WebsocketMessage<{ player: Player }>
      lobbyPlayers.set(player.id, player)
    }

    if (msg.type === 'player:lobby_players_remove') {
      const { player } = msg as WebsocketMessage<{ player: Player }>
      lobbyPlayers.delete(player.id)
    }
  })

  wsEventBus.on('ws:disconnected', clear)

  wsEventBus.on('ws:error', clear)

  const getLobbyPlayers = () => {
    send({
      type: 'player:lobby_players_pull'
    })
  }

  return {
    player,
    clear,
    lobbyPlayers,
    getLobbyPlayers
  }
})
