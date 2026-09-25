export const usePlayerStore = defineStore('player', () => {
  const { wsEventBus, send } = useWsStore()

  const loggedInPlayer = ref<LoggedInPlayer | null>(null)
  const lobbyPlayers = reactive<Map<string, Player>>(new Map())

  const myId = computed(() => loggedInPlayer.value?.id ?? null)
  // 身份判断只看 state.presence；roomNumber 仅供展示，roomId 仅供身份比较
  const isInRoom = computed(() => loggedInPlayer.value?.state.presence === 'inRoom')
  const isInLobby = computed(() => loggedInPlayer.value?.state.presence === 'lobby')
  const isOnlooker = computed(() => loggedInPlayer.value?.state.isOnlooker)
  const currentRoomNumber = computed(() => loggedInPlayer.value?.state.roomNumber)
  const currentRoomId = computed(() => loggedInPlayer.value?.state.roomId)

  const isSelf = (playerId: string) => playerId === loggedInPlayer.value?.id

  const clear = () => {
    loggedInPlayer.value = null
  }

  wsEventBus.on('ws:message', (msg) => {
    if (!msg.type.startsWith('player:')) return

    const event = msg as ServerEvent
    switch (event.type) {
      case 'player:event:logged_in':
        loggedInPlayer.value = event.player
        break
      case 'player:event:state_update':
        if (loggedInPlayer.value && event.id === loggedInPlayer.value.id) {
          loggedInPlayer.value.state = event.state
        }
        break
      case 'player:event:lobby_join':
        lobbyPlayers.set(event.player.id, event.player)
        break
      case 'player:event:lobby_leave':
        lobbyPlayers.delete(event.player.id)
        break
    }
  })

  wsEventBus.on('ws:disconnected', clear)

  wsEventBus.on('ws:error', clear)

  const getLobbyPlayers = async () => {
    const res = (await send({
      type: 'player:get_lobby_players'
    })) as ClientResponse<'player:get_lobby_players'>

    lobbyPlayers.clear()
    res.lobbyPlayers.forEach((p) => lobbyPlayers.set(p.id, p))
  }

  const getPlayerProfile = async (playerId: string) => {
    const { playerId: pid, profile } = (await send({
      type: 'player:get_profile',
      playerId
    })) as ClientResponse<'player:get_profile'>

    return { playerId: pid, profile }
  }

  return {
    loggedInPlayer,
    lobbyPlayers,

    myId,
    isInRoom,
    isInLobby,
    isOnlooker,
    currentRoomNumber,
    currentRoomId,

    isSelf,
    clear,
    getLobbyPlayers,
    getPlayerProfile
  }
})
