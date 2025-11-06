import { wsEventBus } from '..'
import { roomList } from '#shared/utils/test'

export default function roomListHandler() {
  wsEventBus.on('ws:message', ({ peer, msg, user, reply }) => {
    if (msg.type === 'room_list:pull') {
      reply({
        type: 'room_list:pull',
        room_list: roomList
      })
    }
  })
}
