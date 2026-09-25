import { defineWsHandlers } from '~~/server/ws/utils'
import { say } from '~~/server/services/chat'
import { getLobbyPlayers } from '~~/server/services/player'
import { getUserData } from '~~/server/services/user'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('PlayerHandler')

export default defineWsHandlers({
  'player:get_profile': async ({ msg, user }) => {
    // @TODO: 这里需要验证传入参数
    const { playerId } = msg as WebsocketMessage<{ playerId: string }>

    return {
      playerId,
      profile: await getUserData(playerId)
    }
  },
  'player:lobby_players_pull': async ({ msg, user }) => {
    return {
      lobbyPlayers: getLobbyPlayers()
    }
  }
})
