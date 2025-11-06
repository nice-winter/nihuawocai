import { mockdata } from '#shared/utils/mockdata'
import { getAppConfig } from '~~/server/services/app-config'
import type { RoomInfo } from '#shared/interfaces/room'

const roomList = []

const getRoomList = (): RoomInfo[] => {
  return mockdata.roomList
}

export { getRoomList }
