import consola from 'consola'

export const usePlayerStore = defineStore('player', () => {
  const { wsEventBus, send } = useWsStore()

  const loggedInPlayer = ref<LoggedInPlayer | null>(null)
  const lobbyPlayers = reactive<Map<string, Player>>(new Map())

  const myId = computed(() => loggedInPlayer.value?.id ?? null)
  const isInRoom = computed(
    () =>
      loggedInPlayer.value !== null &&
      loggedInPlayer.value.state.type === 'in_room' &&
      loggedInPlayer.value.state.roomNumber !== null
  )
  const isInLobby = computed(
    () =>
      loggedInPlayer.value !== null &&
      loggedInPlayer.value.state.type === 'lobby' &&
      loggedInPlayer.value.state.roomNumber == null
  )
  const isOnlooker = computed(() => loggedInPlayer.value?.state.onlooker)
  const currentRoomNumber = computed(() => loggedInPlayer.value?.state.roomNumber)

  const isSelf = (id: string) => id === loggedInPlayer.value?.id

  const clear = () => {
    loggedInPlayer.value = null
  }

  wsEventBus.on('ws:message', (msg) => {
    if (!msg.type.startsWith('player:')) return

    const event = msg as ServerEvent
    switch (event.type) {
      case 'player:event:logged_in':
        loggedInPlayer.value = event.player_info
        break
      case 'player:event:state_update':
        if (loggedInPlayer.value && event.id === loggedInPlayer.value.id) {
          loggedInPlayer.value.state = event.state
        }
        break
      case 'player:event:lobby_players_add':
        lobbyPlayers.set(event.player.id, event.player)
        break
      case 'player:event:lobby_players_remove':
        lobbyPlayers.delete(event.player.id)
        break
    }
  })

  wsEventBus.on('ws:disconnected', clear)

  wsEventBus.on('ws:error', clear)

  const getLobbyPlayers = async () => {
    const { lobby_players } = (await send({
      type: 'player:lobby_players_pull'
    })) as ClientResponse<'player:lobby_players_pull'>

    lobbyPlayers.clear()
    lobby_players.forEach((p) => lobbyPlayers.set(p.id, p))
  }

  const getPlayerProfile = async (playerId: string) => {
    const { id, profile } = (await send({
      type: 'player:get_profile',
      id: playerId
    })) as ClientResponse<'player:get_profile'>

    return { id, profile }
  }

  return {
    loggedInPlayer,
    lobbyPlayers,

    myId,
    isInRoom,
    isInLobby,
    isOnlooker,
    currentRoomNumber,

    isSelf,
    clear,
    getLobbyPlayers,
    getPlayerProfile
  }
})
