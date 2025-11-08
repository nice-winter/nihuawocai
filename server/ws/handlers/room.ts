import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { WsProcotolRoomJoin } from '#shared/interfaces/protocol'
import { defineWsHandlers } from '../utils/index'
import { createRoom, getRoomList, joinRoom, leaveRoom, sit } from '~~/server/services/room'

const log = (...data: unknown[]) => console.log('[ws-handler]', ...data)

export default defineWsHandlers({
  'room:list_pull': async ({ peer, msg, user, reply }) => {
    const roomList = getRoomList()
    reply({
      type: 'room:list_pull',
      room_list: roomList
    })
  },
  'room:create': async ({ peer, msg, user, reply }) => {
    log('创房', msg)
    if (user) {
      await createRoom(user.id)
    }
  },
  'room:join': async ({ peer, msg, user, reply }) => {
    const _msg = msg as WebsocketMessage<WsProcotolRoomJoin>
    if (user) {
      await joinRoom(_msg.roomNumber, user.id, '')
      log('进房', _msg.roomNumber, user.id, '')
    }
  },
  'room:leave': async ({ peer, msg, user, reply }) => {
    if (user) {
      leaveRoom(user.id)
      log('离开', user.id)
    }
  },
  'room:sit': async ({ peer, msg, user, reply }) => {
    const _msg = msg as WebsocketMessage<{ roomNumber: number }>
    if (user) {
      sit(_msg.roomNumber, user.id, 1)
      log('坐下', user.id, 1)
    }
  }
})
