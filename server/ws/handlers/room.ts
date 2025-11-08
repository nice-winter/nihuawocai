import { consola } from 'consola'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { WsProcotolRoomJoin } from '#shared/interfaces/protocol'
import { defineWsHandlers } from '../utils/index'
import {
  createRoom,
  getRoomList,
  joinRoom,
  leaveRoom,
  seatSwitch,
  sit
} from '~~/server/services/room'

const logger = consola.withTag('Room Handler')

export default defineWsHandlers({
  'room:list_pull': async ({ peer, msg, user, reply }) => {
    const roomList = getRoomList()
    reply({
      type: 'room:list_pull',
      room_list: roomList
    })
  },
  'room:create': async ({ peer, msg, user, reply }) => {
    logger.debug('Create Room:', msg)
    const { opens } = msg as WebsocketMessage<{ opens: number }>
    if (user) {
      reply({
        type: 'room:create',
        ...(await createRoom(user.id, opens))
      })
    }
  },
  'room:join': async ({ peer, msg, user, reply }) => {
    const _msg = msg as WebsocketMessage<WsProcotolRoomJoin>
    if (user) {
      reply({
        type: 'room:join',
        ...(await joinRoom(_msg.roomNumber, user.id, ''))
      })

      logger.debug('Join Room:', _msg.roomNumber, user.id, '')
    }
  },
  'room:leave': async ({ peer, msg, user, reply }) => {
    if (user) {
      reply({ type: 'room:leave', ...leaveRoom(user.id) })

      logger.debug('Leave Room:', user.id)
    }
  },
  'room:sit': async ({ peer, msg, user, reply }) => {
    const _msg = msg as WebsocketMessage<{ roomNumber: number }>
    if (user) {
      reply({ type: 'room:sit', ...sit(_msg.roomNumber, user.id, 1) })

      logger.debug('Sit Down:', user.id, 1)
    }
  },
  'room:seat_switch': async ({ peer, msg, user, reply }) => {
    const { roomNumber, seatIndex, open } = msg as WebsocketMessage<{
      roomNumber: number
      seatIndex: number
      open: boolean
    }>
    if (user) {
      reply({ type: 'room:seat_swtich', ...seatSwitch(roomNumber, seatIndex, open, user.id) })

      logger.debug('Seat Switch:', roomNumber, seatIndex, open)
    }
  }
})
