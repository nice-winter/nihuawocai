import { consola } from 'consola'
import { colors } from 'consola/utils'
import { isOpen, safeSend, type WsPeer } from '~~/server/ws/utils'
import { sendToUser } from '../ws'
import { removeRoomPlayer } from './room'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { UserData } from '#shared/interfaces/userData'
import type { LoggedInPlayer } from '#shared/interfaces/player'

interface ServerPlayer extends LoggedInPlayer {
  peer: WsPeer
}

const logger = consola.withTag('Player Service')

const players = new Map<string, ServerPlayer>()

const getPlayer = (id: string) => players.get(id)

const addPlayer = (user: UserData & { peer: WsPeer }) => {
  const player: ServerPlayer = {
    ...user,
    state: 'lobby'
  }

  players.set(user.id, player)

  sendToUser(
    {
      type: 'player:logged_in',
      player_info: {
        ...user,
        peer: undefined // @todo 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
      }
    },
    user.id
  )

  logger.debug('Added new player:', `${colors.cyan(player.nickname)}@${colors.gray(player.id)}`)
}

const removePlayer = (id: string) => {
  const player = players.get(id)
  if (player) {
    if (typeof player.roomNumber !== 'undefined') {
      removeRoomPlayer(player.roomNumber, id)
    }
    players.delete(id)

    logger.debug('Removed player:', `${colors.cyan(player?.nickname)}@${colors.gray(player?.id)}`)
  }
}

const updatePlayerState = (id: string, roomNumber?: number) => {
  const player = players.get(id)
  if (player) {
    if (typeof roomNumber === 'undefined' || roomNumber < 0) {
      player.state = 'lobby'
      delete player.roomNumber
    } else {
      player.state = 'in_room'
      player.roomNumber = roomNumber
    }

    players.set(id, player)

    sendToUser(
      {
        type: 'player:state_update',
        id,
        state: player.state,
        roomNumber
      },
      id
    )

    logger.debug(
      'Player state updated:',
      `${colors.cyan(player?.nickname)}@${colors.gray(player?.id)}`
    )
  }
}

const sendToPlayer = <T>(msg: WebsocketMessage<T>, id: string | string[]) => {
  const ids = Array.isArray(id) ? id : [id]
  const encoded = {
    ...msg,
    _scope: 'player'
  }

  for (const i of ids) {
    const p = players.get(i)
    if (p && isOpen(p.peer)) safeSend(p.peer, encoded)
  }
}

const sendToAllPlayer = <T>(msg: WebsocketMessage<T>) => {
  const encoded = {
    ...msg,
    _scope: 'all'
  }

  players.forEach((p) => safeSend(p.peer, encoded))
}

const sendToRoom = <T>(msg: WebsocketMessage<T>, roomNumber: number) => {
  const encoded = {
    ...msg,
    _scope: 'room'
  }

  players.forEach((p) => {
    if (
      p.state === 'in_room' &&
      typeof p.roomNumber !== 'undefined' &&
      p.roomNumber === roomNumber
    ) {
      safeSend(p.peer, encoded)
    }
  })
}

const sendToLobby = <T>(msg: WebsocketMessage<T>) => {
  const encoded = {
    ...msg,
    _scope: 'lobby'
  }

  players.forEach((p) => {
    if (p.state === 'lobby') {
      safeSend(p.peer, encoded)
    }
  })
}

export {
  type ServerPlayer,
  players,
  getPlayer,
  addPlayer,
  removePlayer,
  updatePlayerState,
  sendToPlayer,
  sendToAllPlayer,
  sendToRoom,
  sendToLobby
}
