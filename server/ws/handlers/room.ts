import { consola } from 'consola'
import { defineWsHandlers } from '~~/server/ws/utils'
import {
  changePassword,
  createRoom,
  getRoomList,
  invite,
  joinRoom,
  leaveRoom,
  seatSwitch,
  sit
} from '~~/server/services/room'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { WsProcotolRoomJoin } from '#shared/interfaces/protocol'

const logger = consola.withTag('Room Handler')

export default defineWsHandlers({
  'room:list_pull': async () => {
    const roomList = getRoomList()
    return { room_list: roomList }
  },
  'room:create': async ({ msg, user }) => {
    const { opens, options } = msg as WebsocketMessage<{
      opens: number
      options: { password: string; maxOnlookers: number }
    }>

    return await createRoom(user.id, opens, options)
  },
  'room:join': async ({ msg, user }) => {
    const { roomNumber, password, look } = msg as WebsocketMessage<WsProcotolRoomJoin>

    if ((typeof roomNumber !== 'number' && Number(roomNumber < 0)) || Number(roomNumber) > 999)
      throw new Error('非法参数')

    return await joinRoom(Number(roomNumber), user.id, password?.trim().substring(0, 16) || '')
  },
  'room:leave': async ({ msg, user }) => {
    return leaveRoom(user.id)
  },
  'room:sit': async ({ msg, user }) => {
    const { roomNumber, seat } = msg as WebsocketMessage<{ roomNumber: number; seat: number }>

    return await sit(roomNumber, user.id, seat)
  },
  'room:seat_switch': async ({ msg, user }) => {
    const { roomNumber, seat, open } = msg as WebsocketMessage<{
      roomNumber: number
      seat: number
      open: boolean
    }>

    if (seat < 0 || seat > 6) throw new Error('非法参数')

    return seatSwitch(roomNumber, seat, open, user.id)
  },
  'room:password_change': async ({ msg, user }) => {
    const { roomNumber, password } = msg as WebsocketMessage<{
      roomNumber: number
      password: string
    }>

    return changePassword(roomNumber, password, user.id)
  },
  'room:invite': async ({ msg, user }) => {
    const { toId } = msg as WebsocketMessage<{
      toId: string
    }>

    return await invite(user.id, toId)
  }
})
