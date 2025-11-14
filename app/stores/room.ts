import { defineStore } from 'pinia'
import type { Room, RoomInfo } from '#shared/interfaces/room'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { Player } from '#shared/interfaces/player'

/**
 * 游戏房间列表 Store
 * 负责管理游戏房间的列表、当前房间状态以及与房间相关的 WebSocket 通信
 */
export const useRoomStore = defineStore('roomStore', () => {
  const appConfigStore = useAppConfigStore()
  const { appConfig } = storeToRefs(appConfigStore)
  const { wsEventBus, send } = useWsStore()
  const playerStore = usePlayerStore()
  const toast = useToast()

  // State
  const rooms = reactive(new Map<number, RoomInfo>()) // 所有房间的映射表
  const currentPageNumber = ref(0) // 当前页码
  const showOnlyWaitingRooms = ref(false) // 是否只显示等待中的房间
  const currentRoom = ref<Room | null>(null) // 玩家当前所在的房间
  const inviteRecord = reactive<Map<string, number>>(new Map()) // 邀请记录
  const broadcastRecord = reactive<Map<number, number>>(new Map()) // 广播记录

  // Computed
  /**
   * 当前页显示的房间列表（最多显示6个）
   */
  const { currentPage, currentPageItems, prevPage, nextPage } = usePaginatedMap(rooms, 6)
  const currentPageRooms = computed(() => {
    return currentPageItems.value.filter((room) => {
      return showOnlyWaitingRooms.value ? !room.playing : true
    })
  })

  /**
   * 是否为当前房间的房主
   */
  const isCurrentRoomOwner = computed(() => playerStore.player?.id === currentRoom.value?.owner)

  // 工具函数
  /**
   * 清空当前所在房间信息
   */
  const clearCurrentRoom = () => {
    currentRoom.value = null
  }

  /**
   * 更新房间玩家座位信息
   */
  const updateRoomPlayer = (
    roomNumber: number,
    seat: number,
    player: Player,
    action: 'join' | 'sit' | 'leave'
  ) => {
    // 更新房间列表中的房间
    const room = rooms.get(roomNumber)
    if (room) {
      room.players[seat] = action === 'leave' ? null : player
      rooms.set(roomNumber, room)
    }

    // 同步更新当前房间
    if (roomNumber === currentRoom.value?.roomNumber) {
      currentRoom.value.players[seat] = action === 'leave' ? null : player

      if (action === 'join') {
        eventBus.emit('current:room:event:player_join', { player, seat })
      } else if (action === 'sit') {
        eventBus.emit('current:room:event:onlooker_sit', { player, seat })
      } else if (action === 'leave') {
        eventBus.emit('current:room:event:player_leave', { player, seat })
      }
    }
  }

  /**
   * 更新房间旁观者列表
   */
  const updateRoomOnlookers = (
    roomNumber: number,
    updater: (onlookers: Player[]) => void,
    player: Player,
    action: 'join' | 'sit' | 'leave'
  ) => {
    // 更新房间列表中的房间
    const room = rooms.get(roomNumber)
    if (room) {
      updater(room.onlookers)
      rooms.set(roomNumber, room)
    }

    // 同步更新当前房间
    if (roomNumber === playerStore.player?.roomNumber && currentRoom.value) {
      updater(currentRoom.value.onlookers)

      if (action === 'join') {
        eventBus.emit('current:room:event:onlooker_join', { player })
      } else if (action === 'leave') {
        eventBus.emit('current:room:event:onlooker_leave', { player })
      }
    }
  }

  // Watch
  /**
   * 监听玩家状态，如果玩家状态变更为不在房间内的状态，则清空当前所在房间信息
   */
  watch(
    () => playerStore.player?.state,
    (newState) => {
      if (newState !== 'in_room') clearCurrentRoom()
    }
  )

  // WebSocket 事件监听
  wsEventBus.on('ws:connected', () => {
    // WebSocket 连接建立后拉取房间列表
    // pullRoomList()
  })

  wsEventBus.on('ws:message', (msg) => {
    handleRoomMessage(msg)
  })

  /**
   * 处理房间相关的 WebSocket 消息
   */
  const handleRoomMessage = (msg: WebsocketMessage) => {
    switch (msg.type) {
      // 房间列表相关
      case 'room:list_pull':
        handleRoomListPull(msg)
        break
      case 'room:event:create':
        handleRoomCreate(msg)
        break
      case 'room:event:destroy':
        handleRoomDestroy(msg)
        break

      // 房间信息相关
      case 'room:event:info':
        handleRoomInfo(msg)
        break
      case 'room:event:owner_change':
        handleRoomOwnerChange(msg)
        break
      case 'room:event:stage_update':
        // 暂不处理
        break

      // 房间设置相关
      case 'room:event:seat_switch':
        handleSeatSwitch(msg)
        break
      case 'room:event:locked_state_change':
        handleLockedStateChange(msg)
        break
      case 'room:event:password_change':
        handlePasswordChange(msg)
        break

      // 玩家进出相关
      case 'room:event:player_join':
        handlePlayerJoin(msg)
        break
      case 'room:event:player_leave':
        handlePlayerLeave(msg)
        break
      case 'room:event:onlooker_join':
        handleOnlookerJoin(msg)
        break
      case 'room:event:onlooker_leave':
        handleOnlookerLeave(msg)
        break
      case 'room:event:onlooker_sit':
        handleOnlookerSit(msg)
        break

      // 房间邀请相关
      case 'room:event:invite':
        handleInvite(msg)
        break
      case 'room:invite':
        handleInviteRecord(msg)
        break

      // 房间广播相关
      case 'room:event:broadcast':
        handleBroadcast(msg)
        break
      // case 'room:broadcast':
      //   handleBroadcastRecord(msg)
      //   break
    }
  }

  // 房间列表管理
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

  // 房间信息更新
  const handleRoomInfo = (msg: WebsocketMessage) => {
    const { room } = msg as WebsocketMessage<{ room: Room }>
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

  // 房间设置更新
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

  const handleLockedStateChange = (msg: WebsocketMessage) => {
    const { from, locked } = msg as WebsocketMessage<{ from: number; locked: boolean }>
    const room = rooms.get(from)
    if (room) {
      room.locked = locked
      rooms.set(from, room)
    }
  }

  const handlePasswordChange = (msg: WebsocketMessage) => {
    const { roomNumber, password, locked } = msg as WebsocketMessage<{
      roomNumber: number
      locked: boolean
      password: string
    }>

    if (currentRoom.value && roomNumber === currentRoom.value.roomNumber) {
      currentRoom.value.options.password = password
      currentRoom.value.locked = locked

      eventBus.emit('current:room:event:password_change', { locked, password })
    }
  }

  // 玩家进出管理
  const handlePlayerJoin = (msg: WebsocketMessage) => {
    const { from, seat, player } = msg as WebsocketMessage<{
      from: number
      seat: number
      player: Player
    }>
    updateRoomPlayer(from, seat, player, 'join')
  }

  const handlePlayerLeave = (msg: WebsocketMessage) => {
    const { from, seat, player } = msg as WebsocketMessage<{
      from: number
      seat: number
      player: Player
    }>
    updateRoomPlayer(from, seat, player, 'leave')
  }

  const handleOnlookerJoin = (msg: WebsocketMessage) => {
    const { from, player } = msg as WebsocketMessage<{ from: number; id: string; player: Player }>
    updateRoomOnlookers(
      from,
      (onlookers) => {
        onlookers.push(player)
      },
      player,
      'join'
    )
  }

  const handleOnlookerLeave = (msg: WebsocketMessage) => {
    const { from, player } = msg as WebsocketMessage<{ from: number; id: string; player: Player }>
    updateRoomOnlookers(
      from,
      (onlookers) => {
        const index = onlookers.findIndex((p) => p.id === player.id)
        if (index > -1) {
          onlookers.splice(index, 1)
        }
      },
      player,
      'leave'
    )
  }

  const handleOnlookerSit = (msg: WebsocketMessage) => {
    const { from, seat, player } = msg as WebsocketMessage<{
      from: number
      seat: number
      player: Player
    }>
    updateRoomPlayer(from, seat, player, 'sit')

    // 旁观者坐下后需要从旁观者列表中移除
    updateRoomOnlookers(
      from,
      (onlookers) => {
        const index = onlookers.findIndex((p) => p.id === player.id)
        if (index > -1) {
          onlookers.splice(index, 1)
        }
      },
      player,
      'sit'
    )
  }

  // 玩家邀请
  const handleInvite = (msg: WebsocketMessage) => {
    const { from, to, roomNumber, password, duration, expAt } = msg as WebsocketMessage<{
      from: Player
      to: Player
      roomNumber: number
      password: string
      duration: number
      expAt: number
    }>

    toast.add({
      title: `${from.nickname} 向你发来邀请`,
      description: `TA在${roomNumber}号房间等你与TA一起游戏！`,
      avatar: {
        src: from.avatar_url
      },
      duration: duration * 1000,
      orientation: 'horizontal',
      actions: [
        {
          // icon: 'i-lucide-refresh-cw',
          label: '同意',
          color: 'neutral',
          variant: 'outline',
          onClick: (e) => {
            join(roomNumber, password)
            e?.stopPropagation()
          }
        }
      ]
    })
  }

  const handleInviteRecord = (msg: WebsocketMessage) => {
    if (typeof (msg as WebsocketMessage<{ successful: boolean }>).successful === 'undefined') return
    const { from, to, roomNumber, password, duration, expAt } = msg as unknown as WebsocketMessage<{
      from: Player
      to: Player
      roomNumber: number
      password: string
      duration: number
      expAt: number
    }>

    inviteRecord.set(to.id, expAt)

    // 清除过期的邀请信息
    setTimeout(() => {
      inviteRecord.delete(to.id)
    }, expAt - Date.now())
  }

  // 广播
  const handleBroadcast = (msg: WebsocketMessage) => {
    const { from, roomNumber, password, sender, expAt, timestamp } = msg as WebsocketMessage<{
      from: number
      roomNumber: number
      password: string
      sender: Player
      expAt: number
      timestamp: number
    }>

    eventBus.emit('room:event:broadcast', { from, roomNumber, password, sender, expAt, timestamp })

    // 记录该房间广播过期时间，广播按钮根据此记录判断是否冷却，防止频繁广播
    broadcastRecord.set(roomNumber, expAt)
    // 清除过期的房间广播记录
    setTimeout(() => {
      broadcastRecord.delete(roomNumber)
    }, expAt - Date.now())
  }

  // const handleBroadcastRecord = (msg: WebsocketMessage) => {
  //   const { roomNumber, expAt } = msg as WebsocketMessage<{
  //     from: number
  //     roomNumber: number
  //     password: string
  //     sender: Player
  //     expAt: number
  //     timestamp: number
  //   }>
  // }

  // ------------------------ Actions ------------------------
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
  const join = (roomNumber: number, password?: string) => {
    send({
      type: 'room:join',
      roomNumber,
      password
    })
  }

  /**
   * 离开当前房间
   */
  const leave = () => {
    send({
      type: 'room:leave'
    })
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
   * 发送广播
   */
  const broadcast = () => {
    send({
      type: 'room:broadcast'
    })
  }

  /**
   * 邀请玩家
   */
  const invite = (toId: string) => {
    send({
      type: 'room:invite',
      toId
    })
  }

  /**
   * 创建新房间
   */
  const createRoom = (opens: number, options: { password: string; maxOnlookers: number }) => {
    send({
      type: 'room:create',
      opens,
      options
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

  // 未实现的功能
  const sit = (seat: number) => {
    // TODO: 实现坐下逻辑
  }

  return {
    // State
    rooms,
    currentPageNumber,
    showOnlyWaitingRooms,
    currentRoom,
    isCurrentRoomOwner,
    isOwner: isCurrentRoomOwner,
    inviteRecord,
    broadcastRecord,

    // Computed
    currentPageRooms,

    // Actions
    pullRoomList,
    join,
    leave,
    sit,
    switchSeat,
    changeRoomPassword,
    broadcast,
    invite,
    prevPage,
    nextPage,
    createRoom,
    quickMatch
  }
})
