import { defineStore } from 'pinia'

/**
 * 游戏房间列表 Store
 * 负责管理游戏房间的列表、当前房间状态以及与房间相关的 WebSocket 通信
 */
export const useRoomStore = defineStore('room', () => {
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
  const isCurrentRoomOwner = computed(
    () => playerStore.loggedInPlayer?.id === currentRoom.value?.owner
  )

  /**
   * 当前房间的真实（在座位上的）玩家
   */
  const currentRoomRealPlayers = computed(() =>
    currentRoom.value?.players.filter((p) => p !== null)
  )

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
    if (roomNumber === playerStore.currentRoomNumber && currentRoom.value) {
      updater(currentRoom.value.onlookers)

      if (action === 'join') {
        eventBus.emit('current:room:event:onlooker_join', { player })
      } else if (action === 'leave') {
        eventBus.emit('current:room:event:onlooker_leave', { player })
      }
    }
  }

  /**
   * 从当前房间中获取指定玩家
   * @param id
   */
  const getPlayerFromCurrentRoom = (id: string) => {
    return currentRoomRealPlayers.value?.find((p) => p.id === id)
  }

  // Watch
  /**
   * 监听玩家状态，如果玩家状态变更为不在房间内的状态，则清空当前所在房间信息
   */
  watch(
    () => playerStore.loggedInPlayer?.state,
    (newState) => {
      if (newState?.type !== 'in_room') clearCurrentRoom()
    }
  )

  // WebSocket 事件监听
  wsEventBus.on('ws:connected', () => {
    // WebSocket 连接建立后拉取房间列表
    // await pullRoomList()
  })

  wsEventBus.on('ws:message', (msg) => {
    if (!msg.type.startsWith('room:')) return

    const event = msg as ServerEvent
    switch (event.type) {
      // 房间列表相关事件
      case 'room:event:create':
        rooms.set(event.from, event.room)
        break
      case 'room:event:destroy':
        rooms.delete(event.roomNumber)
        // 如果销毁的是当前房间，清空当前房间状态
        if (event.roomNumber === currentRoom.value?.roomNumber) {
          clearCurrentRoom()
        }
        break

      // 房间信息相关
      case 'room:event:info':
        // 如果更新的是玩家当前所在房间，更新当前房间状态
        if (event.room.roomNumber === playerStore.currentRoomNumber) {
          currentRoom.value = event.room
        }
        break
      case 'room:event:owner_change': {
        const room = rooms.get(event.from)
        if (room) {
          room.owner = event.id
          rooms.set(event.from, room)
        }
        // 如果房主变更的是当前房间，同步更新
        if (event.from === playerStore.currentRoomNumber && currentRoom.value) {
          currentRoom.value.owner = event.id
        }
        break
      }
      case 'room:event:stage_update': {
        const room = rooms.get(event.from)
        if (room) {
          room.playing = event.playing
          rooms.set(event.from, room)
        }
        // 如果阶段变更的是当前房间，同步更新
        if (event.from === playerStore.currentRoomNumber && currentRoom.value) {
          currentRoom.value.playing = event.playing
        }
        break
      }

      // 房间设置、状态相关事件
      case 'room:event:seat_switch': {
        const room = rooms.get(event.from)
        if (room) {
          room.seats[event.seat] = event.open
          rooms.set(event.from, room)
        }
        // 同步更新当前房间的座位状态
        if (event.from === currentRoom.value?.roomNumber) {
          currentRoom.value.seats[event.seat] = event.open
        }
        break
      }
      case 'room:event:locked_state_change': {
        const room = rooms.get(event.from)
        if (room) {
          room.locked = event.locked
          rooms.set(event.from, room)
        }
        break
      }
      case 'room:event:password_change':
        if (currentRoom.value && event.roomNumber === currentRoom.value.roomNumber) {
          currentRoom.value.options.password = event.password
          currentRoom.value.locked = event.locked

          eventBus.emit('current:room:event:password_change', {
            locked: event.locked,
            password: event.password
          })
        }
        break

      // 房间玩家进出相关事件
      case 'room:event:player_join':
        updateRoomPlayer(event.from, event.seat, event.player, 'join')
        break
      case 'room:event:player_leave':
        updateRoomPlayer(event.from, event.seat, event.player, 'leave')
        break
      case 'room:event:onlooker_join':
        updateRoomOnlookers(
          event.from,
          (onlookers) => {
            onlookers.push(event.player)
          },
          event.player,
          'join'
        )
        break
      case 'room:event:onlooker_leave':
        updateRoomOnlookers(
          event.from,
          (onlookers) => {
            const index = onlookers.findIndex((p) => p.id === event.player.id)
            if (index > -1) {
              onlookers.splice(index, 1)
            }
          },
          event.player,
          'leave'
        )
        break
      case 'room:event:onlooker_sit':
        updateRoomPlayer(event.from, event.seat, event.player, 'sit')
        // 旁观者坐下后需要从旁观者列表中移除
        updateRoomOnlookers(
          event.from,
          (onlookers) => {
            const index = onlookers.findIndex((p) => p.id === event.player.id)
            if (index > -1) {
              onlookers.splice(index, 1)
            }
          },
          event.player,
          'sit'
        )
        break

      // 房间邀请相关事件
      case 'room:event:invite':
        toast.add({
          title: `${event.from.nickname} 向你发来邀请`,
          description: `TA在${event.roomNumber}号房间等你与TA一起游戏！`,
          avatar: {
            src: event.from.avatar_url
          },
          duration: event.duration * 1000,
          orientation: 'horizontal',
          actions: [
            {
              // icon: 'i-lucide-refresh-cw',
              label: '同意',
              color: 'neutral',
              variant: 'outline',
              onClick: (e) => {
                join(event.roomNumber, event.password)
                e?.stopPropagation()
              }
            }
          ]
        })
        break

      // 房间广播相关事件
      case 'room:event:broadcast':
        eventBus.emit('room:event:broadcast', {
          from: event.from,
          roomNumber: event.roomNumber,
          password: event.password,
          sender: event.sender,
          expAt: event.expAt,
          timestamp: event.timestamp
        })
        // 记录该房间广播过期时间，广播按钮根据此记录判断是否冷却，防止频繁广播
        broadcastRecord.set(event.roomNumber, event.expAt)
        // 清除过期的房间广播记录
        setTimeout(() => {
          broadcastRecord.delete(event.roomNumber)
        }, event.expAt - Date.now())
        break
    }
  })

  // ------------------------ Actions ------------------------
  /**
   * 拉取房间列表
   */
  const pullRoomList = async () => {
    const { room_list } = (await send({
      type: 'room:list_pull'
    })) as ClientResponse<'room:list_pull'>

    rooms.clear()
    room_list.forEach((room) => rooms.set(room.roomNumber, room))
  }

  /**
   * 加入指定房间
   */
  const join = async (roomNumber: number, password?: string) => {
    await send({
      type: 'room:join',
      roomNumber,
      password
    })
  }

  /**
   * 离开当前房间
   */
  const leave = async () => {
    await send({
      type: 'room:leave'
    })
  }

  /**
   * 切换座位开关状态
   */
  const switchSeat = async (roomNumber: number, seat: number, open: boolean) => {
    await send({
      type: 'room:seat_switch',
      roomNumber,
      seat,
      open
    })
  }

  /**
   * 房间内从旁观席坐到座位上
   * @param seat 座位索引
   */
  const sit = async (seat: number) => {
    await send({
      type: 'room:sit',
      seat
    })
  }

  /**
   * 设置房间密码
   */
  const changeRoomPassword = async (roomNumber: number, password?: string) => {
    await send({
      type: 'room:password_change',
      roomNumber,
      password
    })
  }

  /**
   * 发送广播
   */
  const broadcast = async () => {
    await send({
      type: 'room:broadcast'
    })
  }

  /**
   * 邀请玩家
   */
  const invite = async (toId: string) => {
    const msg = await send({
      type: 'room:invite',
      toId
    })

    if (typeof (msg as WebsocketMessage<WS_RECV>).successful === 'undefined') return
    const { to, expAt } = msg as unknown as WebsocketMessage<{
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

  /**
   * 开始游戏
   */
  const start = () => {
    send({
      type: 'room:game_start'
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
    currentRoomRealPlayers,

    // Actions
    pullRoomList,
    join,
    leave,
    sit,
    switchSeat,
    changeRoomPassword,
    broadcast,
    invite,
    start,
    prevPage,
    nextPage,
    createRoom,
    quickMatch,
    getPlayerFromCurrentRoom
  }
})
