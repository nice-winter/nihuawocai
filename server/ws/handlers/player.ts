import { consola } from 'consola'
import { defineWsHandlers } from '~~/server/ws/utils'
import { say } from '~~/server/services/chat'
import { getLobbyPlayers } from '~~/server/services/player'
import { getUserData } from '~~/server/services/user'

const logger = consola.withTag('Player Handler')

export default defineWsHandlers({
  'player:get_profile': async ({ msg, user }) => {
    // @TODO: 这里需要验证传入参数
    const { id } = msg as WebsocketMessage<{ id: string }>

    return {
      id,
      profile: await getUserData(id)
    }
  },
  'player:lobby_players_pull': async ({ msg, user }) => {
    return {
      lobby_players: getLobbyPlayers()
    }
  }
})
