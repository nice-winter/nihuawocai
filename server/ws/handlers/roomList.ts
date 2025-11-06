import { wsEventBus } from '..'
import { mockdata } from '#shared/utils/mockdata'
import { getAppConfig } from '~~/server/services/appconfig'

export default async function roomListHandler() {
  const appConfig = await getAppConfig()

  wsEventBus.on('ws:message', async ({ peer, msg, user, reply }) => {
    if (msg.type === 'room_list:pull') {
      reply({
        type: 'room_list:pull',
        room_list: mockdata.roomList
      })
    }

    if (msg.type === 'room_list:room_create') {
      //
    }
  })
}
