import { defineWsHandlers } from '../utils/index'
import { getRoomList } from '~~/server/services/room'

export default defineWsHandlers({
  'room_list:pull': async ({ peer, msg, user, reply }) => {
    const roomList = getRoomList()
    reply({
      type: 'room_list:pull',
      room_list: roomList
    })
  },
  'room_list:room_create': async (e) => {}
})
