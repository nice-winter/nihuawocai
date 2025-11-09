import { defineStore } from 'pinia'
import type { Room, RoomInfo } from '#shared/interfaces/room'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { Player } from '#shared/interfaces/player'

/**
 * 游戏房间列表 Store
 * 负责管理游戏房间的列表、当前房间状态以及与房间相关的 WebSocket 通信
 */
export const useRoomStore = defineStore('roomStore', () => {
  // 依赖注入
  const { wsEventBus, send } = useWsStore()
  const playerStore = usePlayerStore()

  // State
  const rooms = reactive(new Map<number, RoomInfo>()) // 所有房间的映射表
  const currentPageNumber = ref(0) // 当前页码
  const showOnlyWaitingRooms = ref(false) // 是否只显示等待中的房间
  const currentRoom = ref<Room | null>(null) // 玩家当前所在的房间
  const clearCurrentRoom = () => (currentRoom.value = null) // 清空当前所在房间信息
  const updateCurrentRoom = () => {
    /** @todo 更新当前所在房间信息（未实现） */
  }
  const isCurrentRoomOwner = computed(() => playerStore.player?.id === currentRoom.value?.owner)

  // Computed
  /**
   * 当前页显示的房间列表（最多显示6个）
   */
  const currentPageRooms = computed(() => {
    const arr = Array.from(rooms.values())
    return arr.length <= 6 ? arr : arr.slice(0, 5)
  })

  // Watch
  /**
   * 监听玩家状态，如果玩家状态变更为不再房间内的状态，则清空当前所在房间信息
   */
  watch(
    () => playerStore.player?.state,
    (newState) => {
      if (newState !== 'in_room') clearCurrentRoom()
    }
  )

  // WebSocket 事件监听
  wsEventBus.on('ws:connected', () => {
    // ...
  })

  wsEventBus.on('ws:message', (msg) => {
    handleRoomListMessage(msg)
  })

  /**
   * 处理房间相关的WebSocket消息
   */
  const handleRoomListMessage = (msg: WebsocketMessage) => {
    switch (msg.type) {
      // 房间列表拉取
      case 'room:list_pull':
        handleRoomListPull(msg)
        break

      // 房间创建事件
      case 'room:event:create':
        handleRoomCreate(msg)
        break

      // 房间销毁
      case 'room:event:destroy':
        handleRoomDestroy(msg)
        break

      // 房间信息更新
      case 'room:event:info':
        handleRoomInfo(msg)
        break

      // 房主变更
      case 'room:event:owner_change':
        handleRoomOwnerChange(msg)
        break

      // 房间阶段更新
      case 'room:event:stage_update':
        // 暂不处理
        break

      // 玩家加入房间
      case 'room:event:player_join':
        handlePlayerJoin(msg)
        break

      // 旁观者加入
      case 'room:event:onlooker_join':
        handleOnlookerJoin(msg)
        break

      // 玩家离开房间
      case 'room:event:player_leave':
        handlePlayerLeave(msg)
        break

      // 旁观者离开
      case 'room:event:onlooker_leave':
        handleOnlookerLeave(msg)
        break

      // 旁观者坐下
      case 'room:event:onlooker_sit':
        handleOnlookerSit(msg)
        break

      // 座位开关状态切换
      case 'room:event:seat_switch':
        handleSeatSwitch(msg)
        break

      // 房间锁定状态更新
      case 'room:event:locked_state_change':
        handleLockedStateChange(msg)
        break

      // 当前房间密码状态更新
      case 'room:event:password_change':
        handlePasswordChange(msg)
        break
    }
  }

  // WebSocket 消息处理函数
  const handleRoomListPull = (msg: WebsocketMessage) => {
    const { room_list } = msg as WebsocketMessage<{ room_list: RoomInfo[] }>
    rooms.clear()
    room_list.forEach((room) => rooms.set(room.roomNumber, room))
  }

  const handleRoomCreate = (msg: WebsocketMessage) => {
    const { room, from } = msg as WebsocketMessage<{ room: RoomInfo; from: number }>
    rooms.set(from, room)
  }

  const handleRoomDestroy = (msg: WebsocketMessage) => {
    const { roomNumber } = msg as WebsocketMessage<{ roomNumber: number }>
    rooms.delete(roomNumber)
    // 如果销毁的是当前房间，清空当前房间状态
    if (roomNumber === currentRoom.value?.roomNumber) {
      clearCurrentRoom()
    }
  }

  const handleRoomInfo = (msg: WebsocketMessage) => {
    const { room, id } = msg as WebsocketMessage<{ room: Room; id: string }>
    // 如果更新的是玩家当前所在房间，更新当前房间状态
    if (room.roomNumber === playerStore.player?.roomNumber) {
      currentRoom.value = room
    }
  }

  const handleRoomOwnerChange = (msg: WebsocketMessage) => {
    const { from, id } = msg as WebsocketMessage<{ from: number; id: string }>
    const room = rooms.get(from)
    if (room) {
      room.owner = id
      rooms.set(from, room)
    }

    // 如果房主变更的是当前房间，同步更新
    if (from === playerStore.player?.roomNumber && currentRoom.value) {
      currentRoom.value.owner = id
    }
  }

  const handlePlayerJoin = (msg: WebsocketMessage) => {
    const { from, seat, player } = msg as WebsocketMessage<{
      from: number
      seat: number
      player: Player
    }>
    updateRoomPlayer(from, seat, player)
  }

  const handleOnlookerJoin = (msg: WebsocketMessage) => {
    const { from, player } = msg as WebsocketMessage<{ from: number; player: Player }>
    const room = rooms.get(from)
    if (room) {
      room.onlookers.push(player)
      rooms.set(from, room)
    }
  }

  const handlePlayerLeave = (msg: WebsocketMessage) => {
    const { from, seat, player } = msg as WebsocketMessage<{
      from: number
      seat: number
      player: Player
    }>
    updateRoomPlayer(from, seat, null)
  }

  const handleOnlookerLeave = (msg: WebsocketMessage) => {
    const { from, player } = msg as WebsocketMessage<{ from: number; player: Player }>
    const room = rooms.get(from)
    if (room) {
      const index = room.onlookers.findIndex((p) => p.id === player.id)
      if (index > -1) {
        room.onlookers.splice(index, 1)
        rooms.set(from, room)
      }
    }
  }

  const handleOnlookerSit = (msg: WebsocketMessage) => {
    const { from, seat, player } = msg as WebsocketMessage<{
      from: number
      seat: number
      player: Player
    }>
    updateRoomPlayer(from, seat, player)
  }

  const handleSeatSwitch = (msg: WebsocketMessage) => {
    const { from, seat, open } = msg as WebsocketMessage<{
      from: number
      seat: number
      open: boolean
    }>
    const room = rooms.get(from)
    if (room) {
      room.seats[seat] = open
      rooms.set(from, room)
    }

    // 同步更新当前房间的座位状态
    if (from === currentRoom.value?.roomNumber) {
      currentRoom.value.seats[seat] = open
    }
  }

  /**
   * 更新房间玩家座位信息
   */
  const updateRoomPlayer = (roomNumber: number, seat: number, player: Player | null) => {
    const room = rooms.get(roomNumber)
    if (room) {
      room.players[seat] = player
      rooms.set(roomNumber, room)
    }

    // 同步更新当前房间
    if (roomNumber === currentRoom.value?.roomNumber) {
      currentRoom.value.players[seat] = player
    }
  }

  /**
   * 更新房间锁定状态
   */
  function handleLockedStateChange(msg: WebsocketMessage) {
    const { from, locked } = msg as WebsocketMessage<{
      from: number
      locked: boolean
    }>

    const room = rooms.get(from)
    if (room) {
      room.locked = locked
      rooms.set(from, room)
    }
  }

  /**
   * 更新当前房间锁定状态
   * @param msg
   */
  function handlePasswordChange(msg: WebsocketMessage) {
    const { roomNumber, password, locked } = msg as WebsocketMessage<{
      roomNumber: number
      locked: boolean
      password: string
    }>

    if (currentRoom.value && roomNumber === currentRoom.value.roomNumber) {
      currentRoom.value.options.password = password
      currentRoom.value.locked = locked
    }
  }

  // Actions
  /**
   * 拉取房间列表
   */
  const pullRoomList = () => {
    send({
      type: 'room:list_pull'
    })
  }

  /**
   * 加入指定房间
   */
  const join = (roomNumber: number, password?: string, look?: boolean) => {
    send({
      type: 'room:join',
      roomNumber,
      password
    })
  }

  /**
   * 离开当前房间
   */
  const leave = (roomNumber?: number) => {
    send({
      type: 'room:leave'
    })
  }

  /**
   * 坐下（暂未实现）
   */
  const sit = (seat: number) => {
    // TODO: 实现坐下逻辑
  }

  /**
   * 切换座位开关状态
   */
  const switchSeat = (roomNumber: number, seat: number, open: boolean) => {
    send({
      type: 'room:seat_switch',
      roomNumber,
      seat,
      open
    })
  }

  /**
   * 设置房间密码
   */
  const changeRoomPassword = (roomNumber: number, password?: string) => {
    send({
      type: 'room:password_change',
      roomNumber,
      password
    })
  }

  /**
   * 上一页（暂未实现）
   */
  const prevPage = () => {
    // TODO: 实现上一页逻辑
  }

  /**
   * 下一页（暂未实现）
   */
  const nextPage = () => {
    // TODO: 实现下一页逻辑
  }

  /**
   * 创建新房间
   */
  const createRoom = () => {
    send({
      type: 'room:create',
      opens: 7, // 默认开启7个座位
      options: {
        password: null, // 无密码
        look: true // 允许旁观
      }
    })
  }

  /**
   * 快速匹配
   */
  const quickMatch = () => {
    send({
      type: 'room:quick_match'
    })
  }

  return {
    // State
    rooms,
    currentPageNumber,
    showOnlyWaitingRooms,
    currentRoom,
    isCurrentRoomOwner,
    isOwner: isCurrentRoomOwner,

    // Computed
    currentPageRooms,

    // Actions
    pullRoomList,
    join,
    leave,
    sit,
    switchSeat,
    changeRoomPassword,
    prevPage,
    nextPage,
    createRoom,
    quickMatch
  }
})
