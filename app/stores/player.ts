import type { LoggedInPlayer, Player, PlayerState } from '#shared/interfaces/player'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import consola from 'consola'

export const usePlayerStore = defineStore('playerStore', () => {
  const { wsEventBus, send } = useWsStore()

  const loggedInPlayer = ref<LoggedInPlayer | null>(null)
  const lobbyPlayers = reactive<Map<string, Player>>(new Map())

  const isInRoom = computed(
    () =>
      loggedInPlayer.value?.state.type === 'in_room' &&
      loggedInPlayer.value?.state.roomNumber !== null
  )
  const isInLobby = computed(
    () =>
      loggedInPlayer.value?.state.type === 'lobby' && loggedInPlayer.value?.state.roomNumber == null
  )
  const currentRoomNumber = computed(() => loggedInPlayer.value?.state.roomNumber)
  const isOnlooker = computed(() => loggedInPlayer.value?.state.onlooker)

  const isSelf = (id: string) => id === loggedInPlayer.value?.id

  const clear = () => {
    loggedInPlayer.value = null
  }

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type === 'player:event:logged_in') {
      const { player_info } = msg as WebsocketMessage<{ player_info: LoggedInPlayer }>
      loggedInPlayer.value = player_info
    }

    if (msg.type === 'player:event:state_update') {
      const { id, state } = msg as WebsocketMessage<PlayerState>
      if (loggedInPlayer.value && id === loggedInPlayer.value.id) {
        loggedInPlayer.value.state = state
      }
    }

    // 大厅空闲玩家相关
    if (msg.type === 'player:event:lobby_players_add') {
      const { player } = msg as WebsocketMessage<{ player: Player }>
      lobbyPlayers.set(player.id, player)
    }

    if (msg.type === 'player:event:lobby_players_remove') {
      const { player } = msg as WebsocketMessage<{ player: Player }>
      lobbyPlayers.delete(player.id)
    }
  })

  wsEventBus.on('ws:disconnected', clear)

  wsEventBus.on('ws:error', clear)

  const getLobbyPlayers = async () => {
    const { lobby_players } = (await send({
      type: 'player:lobby_players_pull'
    })) as WebsocketMessage<{ lobby_players: Player[] }>

    lobbyPlayers.clear()
    lobby_players.forEach((p) => lobbyPlayers.set(p.id, p))
  }

  const getPlayerProfile = async (playerId: string) => {
    const { id, profile } = (await send({
      type: 'player:get_profile',
      id: playerId
    })) as WebsocketMessage<{ id: string; profile: Player }>

    return { id, profile }
  }

  return {
    loggedInPlayer,
    lobbyPlayers,

    isInRoom,
    isInLobby,
    currentRoomNumber,
    isOnlooker,

    isSelf,
    clear,
    getLobbyPlayers,
    getPlayerProfile
  }
})
