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

const logger = consola.withTag('Room Handler')

export default defineWsHandlers({
  'room:list_pull': async () => {
    const roomList = getRoomList()
    return { room_list: roomList }
  },
  'room:quick_match': async ({ user }) => {
    return await quickMatch(user.id)
  },
  'room:create': async ({ msg, user }) => {
    const { opens, options } = msg as WebsocketMessage<WsProcotol['room']['create']>

    return await createRoom(user.id, opens, options)
  },
  'room:join': async ({ msg, user }) => {
    const { roomNumber, password, look } = msg as WebsocketMessage<WsProcotol['room']['join']>

    if ((typeof roomNumber !== 'number' && Number(roomNumber < 0)) || Number(roomNumber) > 999)
      throw new Error('非法参数')

    return await joinRoom(Number(roomNumber), user.id, password?.trim().substring(0, 16) || '')
  },
  'room:leave': async ({ msg, user }) => {
    return leaveRoom(user.id)
  },
  'room:sit': async ({ msg, user }) => {
    const { seat } = msg as WebsocketMessage<WsProcotol['room']['sit']>

    return await sit(user.id, seat)
  },
  'room:seat_switch': async ({ msg, user }) => {
    const { roomNumber, seat, open } = msg as WebsocketMessage<WsProcotol['room']['sitSwitch']>

    if (seat < 0 || seat > 6) throw new Error('非法参数')

    return seatSwitch(roomNumber, seat, open, user.id)
  },
  'room:password_change': async ({ msg, user }) => {
    const { roomNumber, password } = msg as WebsocketMessage<WsProcotol['room']['passwordChange']>

    return changePassword(roomNumber, password, user.id)
  },
  'room:broadcast': async ({ user }) => {
    return await broadcast(user.id)
  },
  'room:invite': async ({ msg, user }) => {
    const { toId } = msg as WebsocketMessage<WsProcotol['room']['invite']>

    return await invite(user.id, toId)
  },
  'room:game_start': async ({ msg, user }) => {
    return await start(user.id)
  }
})
