import { defineStore } from 'pinia'
import type { RoomInfo } from '#shared/interfaces/room'
import type { WebsocketMessage } from '#shared/interfaces/ws'

export const useGameRoomListStore = defineStore('gameRoomListStore', () => {
  const { wsEventBus, send } = useWsStore()

  const roomList = reactive<RoomInfo[]>([])
  const currentPageRoomList = reactive<RoomInfo[]>([])
  const currentPageNumber = ref(0)
  const showOnlyWaitingRooms = ref(false)

  wsEventBus.on('ws:connected', () => {
    send({
      type: 'room_list:pull'
    })
  })

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type === 'room_list:pull') {
      roomList.length = 0
      roomList.push(...(msg as WebsocketMessage<{ room_list: RoomInfo[] }>).room_list)
    }

    if (msg.type === 'room_list:room_create') {
      roomList.push((msg as WebsocketMessage<{ room: RoomInfo }>).room)
    }

    if (msg.type === 'room_list:room_destroy') {
    }

    if (msg.type === 'room_list:room_stage_change') {
    }

    if (msg.type === 'room_list:room_player_join') {
    }

    if (msg.type === 'room_list:room_player_leave') {
    }
  })

  const join = (roomNumber: number, look?: boolean) => {
    console.log(`[房间列表]`, !look ? `[进房]` : `[旁观]`, roomNumber)
  }

  const prevPage = () => {}
  const nextPage = () => {}

  const createRoom = () => {
    send({
      type: 'room_list:room_create',
      room_custom_options: {
        password: null,
        playerNumber: 7,
        look: true
      }
    })
  }

  const quickMatch = () => {
    send({
      type: 'room_list:quick_match'
    })
  }

  return {
    roomList,
    currentPageRoomList,
    currentPageNumber,
    join,
    prevPage,
    nextPage,
    showOnlyWaitingRooms,
    createRoom,
    quickMatch
  }
})
