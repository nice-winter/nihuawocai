import { isOpen, safeSend, type WsPeer } from '~~/server/ws/utils'
import type { UserData } from '#shared/interfaces/userData'
import { sendToUser } from '../ws'
import { removeRoomPlayer } from './room'
import type { WebsocketMessage } from '#shared/interfaces/ws'

interface Player extends UserData {
  peer: WsPeer
  state: 'offline' | 'lobby' | 'in_room'
  roomNumber?: number
}

const players = new Map<string, Player>()

const getPlayer = (id: string) => players.get(id)

const addPlayer = (user: UserData & { peer: WsPeer }) => {
  const player: Player = {
    ...user,
    state: 'lobby'
  }

  players.set(user.id, player)

  sendToUser(
    {
      type: 'user:state_update',
      id: user.id,
      state: player.state
    },
    user.id
  )
}

const removePlayer = (id: string) => {
  const player = players.get(id)
  if (player) {
    if (typeof player.roomNumber !== 'undefined') {
      removeRoomPlayer(player.roomNumber, id)
    }
    players.delete(id)
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
        type: 'user:state_update',
        id,
        state: player.state,
        roomNumber
      },
      id
    )
  }
}

const sendToPlayer = <T>(msg: WebsocketMessage<T>, id: string | string[]) => {
  const ids = Array.isArray(id) ? id : [id]
  const encoded = encode(msg)

  for (const i of ids) {
    const p = players.get(i)
    if (p && isOpen(p.peer)) safeSend(p.peer, encoded)
  }
}

const sendToAllPlayer = <T>(msg: WebsocketMessage<T>) => {
  const encoded = encode(msg)
  players.forEach((p) => safeSend(p.peer, encoded))
}

const sendToRoom = <T>(msg: WebsocketMessage<T>, roomNumber: number) => {
  const encoded = encode(msg)
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
  const encoded = encode(msg)
  players.forEach((p) => {
    if (p.state === 'lobby') {
      safeSend(p.peer, encoded)
    }
  })
}

export {
  type Player,
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
