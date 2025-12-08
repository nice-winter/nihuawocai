import { consola } from 'consola'
import { defineWsHandlers } from '~~/server/ws/utils'
import {
  broadcast,
  changePassword,
  createRoom,
  getRoomList,
  invite,
  start,
  joinRoom,
  leaveRoom,
  seatSwitch,
  sit,
  quickMatch
} from '~~/server/services/room'
import {
  roomCreateSchema,
  roomJoinSchema,
  roomSitSchema,
  roomSeatSwitchSchema,
  roomPasswordChangeSchema,
  roomInviteSchema
} from '~~/server/ws/schemas/room'

const _logger = consola.withTag('Room Handler')

export default defineWsHandlers({
  'room:list_pull': async () => {
    const roomList = getRoomList()
    return { room_list: roomList }
  },
  'room:quick_match': async ({ user }) => {
    return await quickMatch(user.id)
  },
  'room:create': async ({ msg, user }) => {
    const validData = roomCreateSchema.parse(msg)
    const { opens, options } = validData

    return await createRoom(user.id, opens, options)
  },
  'room:join': async ({ msg, user }) => {
    const validData = roomJoinSchema.parse(msg)
    const { roomNumber, password } = validData

    return await joinRoom(Number(roomNumber), user.id, password?.trim().substring(0, 16) || '')
  },
  'room:leave': async ({ user }) => {
    return leaveRoom(user.id)
  },
  'room:sit': async ({ msg, user }) => {
    const validData = roomSitSchema.parse(msg)
    const { seat } = validData

    return await sit(user.id, seat)
  },
  'room:seat_switch': async ({ msg, user }) => {
    const validData = roomSeatSwitchSchema.parse(msg)
    const { roomNumber, seat, open } = validData

    return seatSwitch(roomNumber, seat, open, user.id)
  },
  'room:password_change': async ({ msg, user }) => {
    const validData = roomPasswordChangeSchema.parse(msg)
    const { roomNumber, password } = validData

    return changePassword(roomNumber, password, user.id)
  },
  'room:broadcast': async ({ user }) => {
    return await broadcast(user.id)
  },
  'room:invite': async ({ msg, user }) => {
    const validData = roomInviteSchema.parse(msg)
    const { toId } = validData

    return await invite(user.id, toId)
  },
  'room:game_start': async ({ user }) => {
    return await start(user.id)
  }
})
