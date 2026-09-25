import { defineWsHandlers } from '~~/server/ws/utils'
import {
  sendLobbyBroadcast,
  changePassword,
  createRoom,
  getRoomByNumber,
  getRoomList,
  invite,
  start,
  joinRoom,
  leaveRoom,
  setSeatOpen,
  sit,
  quickMatch
} from '~~/server/services/room'
import {
  roomCreateSchema,
  roomJoinSchema,
  roomSitSchema,
  roomSeatOpenChangeSchema,
  roomPasswordChangeSchema,
  roomInviteSchema
} from '~~/server/ws/schemas/room'

export default defineWsHandlers({
  'room:get_rooms': async () => {
    const roomList = getRoomList()
    return { rooms: roomList }
  },
  'room:quick_match': async ({ user }) => {
    return await quickMatch(user.id)
  },
  'room:create': async ({ msg, user }) => {
    const validData = roomCreateSchema.parse(msg)
    const { openSeatCount, joinOptions } = validData

    return await createRoom(user.id, openSeatCount, joinOptions)
  },
  'room:join': async ({ msg, user }) => {
    const validData = roomJoinSchema.parse(msg)
    const { roomNumber, roomId, password, asOnlooker } = validData

    const room = getRoomByNumber(Number(roomNumber))
    if (!room) throw new Error('房间不存在')
    // 邀请/广播携带 roomId 时校验身份，防止旧引用误入同号新房
    if (roomId && room.id !== roomId) throw new Error('房间已解散或不存在')

    return await joinRoom(room.id, user.id, password?.trim().substring(0, 16) || '', asOnlooker)
  },
  'room:leave': async ({ user }) => {
    return leaveRoom(user.id)
  },
  'room:sit': async ({ msg, user }) => {
    const validData = roomSitSchema.parse(msg)
    const { seat } = validData

    return await sit(user.id, seat)
  },
  'room:seat_open_change': async ({ msg, user }) => {
    const validData = roomSeatOpenChangeSchema.parse(msg)
    const { seat, isOpen } = validData

    return setSeatOpen(user.id, seat, isOpen)
  },
  'room:password_change': async ({ msg, user }) => {
    const validData = roomPasswordChangeSchema.parse(msg)
    const { password } = validData

    return changePassword(user.id, password)
  },
  'room:lobby_broadcast': async ({ user }) => {
    return await sendLobbyBroadcast(user.id)
  },
  'room:invite': async ({ msg, user }) => {
    const validData = roomInviteSchema.parse(msg)
    const { targetId } = validData

    return await invite(user.id, targetId)
  },
  'room:game_start': async ({ user }) => {
    return await start(user.id)
  }
})
