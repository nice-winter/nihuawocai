import { consola } from 'consola'
import { defineWsHandlers } from '~~/server/ws/utils'
import { say } from '~~/server/services/chat'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import { getLobbyPlayers } from '~~/server/services/player'

const logger = consola.withTag('Player Handler')

export default defineWsHandlers({
  'player:lobby_players_pull': async ({ msg, user }) => {
    return {
      lobby_players: getLobbyPlayers()
    }
  }
})
