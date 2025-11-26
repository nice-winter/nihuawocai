import { consola } from 'consola'
import { colors } from 'consola/utils'
import { getAppConfig } from '~~/server/services/app-config'
import { defu } from 'defu'
import {
  playerEventBus,
  getPlayer,
  updatePlayerState,
  sendToAllPlayer,
  sendToPlayer,
  sendToRoom,
  checkPlayerIsInRoom,
  checkPlayerIsInLobby
} from './player'
import { getUserData } from './user'
import mitt from 'mitt'
import { nanoid } from 'nanoid'

type RoomEventBus = {
  'room:event:create': {
    roomNumber: number
    room: Room
  }
  'room:event:destroy': {
    roomNumber: number
  }
  'room:event:player_join': {
    seat: number
    player: UserData
    roomNumber: number
    room: Room
  }
  'room:event:player_leave': {
    seat: number
    player: UserData
    roomNumber: number
    room: Room
  }
  'room:event:onlooker_join': {
    player: UserData
    roomNumber: number
    room: Room
  }
  'room:event:onlooker_sit': {
    seat: number
    player: UserData
    roomNumber: number
    room: Room
  }
  'room:event:onlooker_leave': {
    player: UserData
    roomNumber: number
    room: Room
  }
  'room:event:game_start': {
    roomNumber: number
    room: Room
  }
  'room:event:game_end': {
    roomNumber: number
    room: Room
  }
}

const logger = consola.withTag('Room Service')

// ------------------------- Records -------------------------
/**
 * 事件总线
 */
const roomEventBus = mitt<RoomEventBus>()

/**
 * 所有房间
 */
const rooms = new Map<number, Room>()

/**
 * 玩家邀请记录
 */
const inviteRecord = new Map<string, { expAt: number }>()

/**
 * 房间广播记录
 */
const broadcastRecord = new Map<number, { expAt: number }>()

// ---------------------- Player Events ----------------------
// playerEventBus.on('player:connect', ({ player }) => {
//   // @TODO: 暂时没用上
// })

// 玩家离线时，从他所在的房间中移除他
playerEventBus.on('player:beforeDisconnect', ({ player }) => {
  if (checkPlayerIsInRoom(player.id)) {
    removeRoomPlayer(player.state.roomNumber!, player.id)
  }
})

// ------------------------ Actions ------------------------
/**
 * 获取房间
 * @param roomNumber 房间号
 */
const getRoom = (roomNumber: number) => {
  return rooms.get(roomNumber)
}

/**
 * 替换 Room 属性
 * @param room
 * @param property
 */
const roomPropertyFilter = (room: Room) => {
  return defu({ options: { password: '***' } }, room)
}

/**
 * 获取整个房间列表
 */
const getRoomList = (): RoomInfo[] => {
  return [...rooms.values().map((r) => roomPropertyFilter(r))]
}

/**
 * 获取下一个房间号
 * 以最小空洞索引生成房间号，例如考虑 0, 1, 2, 5, 7, 9...，最小空洞索引值为 3
 */
const getNextRoomNumber = () =>
  Array.from({ length: rooms.size + 1 }, (_, i) => i).find((i) => !rooms.has(i))!

/**
 * 创建房间
 * @param owner 房主 id
 * @param opens 默认坑位数量（0~6）；0 为全关，6 为全开，并且始终有一个坑位给房主
 * @param options 房间设置
 * @param config 房间自己的配置（如果有），这会覆盖全局应用配置中的房间配置
 */
const createRoom = async (
  owner: string,
  opens?: number,
  options?: Partial<RoomOptions>,
  config?: Partial<RoomConfig>
) => {
  const appConfig = await getAppConfig()
  const user = await getUserData(owner)

  if (checkPlayerIsInRoom(owner)) throw new Error('当前已在房间内')

  const defaultRoomOptions: RoomOptions = {
    password: '',
    maxOnlookers: 5,
    libIds: []
  }

  const roomOptions: RoomOptions = defu(options, defaultRoomOptions),
    roomConfig = config ?? null,
    roomNumber = getNextRoomNumber(),
    seats = Array.from({ length: 7 }, (_, i) => i === 0 || i <= (opens || 0)),
    locked = roomOptions.password.trim() !== ''

  const room: Room = {
    id: nanoid(),
    options: roomOptions,
    config: roomConfig,
    roomNumber,
    owner,
    seats,
    locked,
    players: new Array(7).fill(null),
    onlookers: [],
    playing: false
  }

  rooms.set(roomNumber, room)

  // 把房主加入房间
  await joinRoom(roomNumber, owner, roomOptions.password)

  // 向所有人推送新的房间信息
  // @TODO: 需要过滤不需要的字段
  const roomInfo: RoomInfo = roomPropertyFilter(getRoom(roomNumber)!)

  // 广播房间创建事件
  sendToAllPlayer({
    type: 'room:event:create',
    from: roomNumber,
    room: roomInfo
  })

  roomEventBus.emit('room:event:create', {
    roomNumber,
    room: getRoom(roomNumber)!
  })

  logger.info(
    `A new room ${colors.cyan(room.roomNumber)} has been created by`,
    `${colors.cyan(user.nickname)}@${user.id}`,
    `at ${colors.gray(new Date().toLocaleString())}`
  )

  return {
    room: getRoom(roomNumber)
  }
}

/**
 * 销毁房间，当前房间内的玩家会逐个更新为“不在房间内”状态
 * @param roomNumber
 */
const destroyRoom = (roomNumber: number) => {
  const room = rooms.get(roomNumber)
  if (room) {
    rooms.delete(roomNumber)
    // 广播房间销毁事件
    sendToAllPlayer({
      type: 'room:event:destroy',
      from: roomNumber,
      roomNumber
    })

    room.players
      .filter((p) => p !== null)
      .forEach((p) => {
        updatePlayerState(p.id)
      })
    room.onlookers.forEach((p) => {
      updatePlayerState(p.id)
    })

    roomEventBus.emit('room:event:destroy', {
      roomNumber
    })

    logger.info(
      `Room ${colors.cyan(room.roomNumber)} has been destroyed at ${colors.gray(
        new Date().toLocaleString()
      )}`
    )
  }
}

/**
 * 更新房间
 * @param roomNumber
 * @param room
 */
const updateRoom = (roomNumber: number, room: Room) => {
  if (room.players.length !== 7) throw new Error('房间信息错误')
  rooms.set(roomNumber, room)
}

const joinRoom = async (roomNumber: number, id: string, password?: string) => {
  if (checkPlayerIsInRoom(id)) throw new Error('当前已在房间内')

  const room = rooms.get(roomNumber)
  const user = await getUserData(id)

  if (room) {
    if (room.options.password.trim() !== '' && password?.trim() !== room.options.password.trim())
      throw new Error('密码错误')

    /**
     * 尝试加入旁观席
     */
    const tryJoinAsOnlooker = () => {
      // 当前旁观人数是否少于房间设置允许的最大旁观人数
      if (room.onlookers.length < room.options.maxOnlookers) {
        room.onlookers.push(user) // 加入旁观者列表
        // 更新房间和玩家状态
        updateRoom(roomNumber, room)
        updatePlayerState(user.id, roomNumber, true)
        // 广播旁观者进房事件
        sendToAllPlayer({
          type: 'room:event:onlooker_join',
          from: roomNumber,
          player: user
        })

        roomEventBus.emit('room:event:onlooker_join', {
          roomNumber,
          player: user,
          room
        })
      } else {
        throw new Error('旁观人数已满')
      }
    }

    /**
     * 尝试以玩家加入
     */
    const tryJoinAsPlayer = () => {
      // 打开的坑位数是否大于当前玩家总数
      if (room.seats.filter((s) => s).length > room.players.filter((p) => p).length) {
        // 查找第一个没有玩家且呈打开状态的坑位索引号
        const seat = room.players.findIndex((i, index) => i === null && room.seats[index] === true)
        // 判断是否已找到索引，找不到就是说明所有坑位不是有人就是被关掉了
        if (seat > -1) {
          room.players[seat] = user // 坐到当前坑位
          // 更新房间和玩家状态
          updateRoom(roomNumber, room)
          updatePlayerState(user.id, roomNumber)
          // 广播玩家进房事件
          sendToAllPlayer({
            type: 'room:event:player_join',
            from: roomNumber,
            seat,
            player: user
          })

          roomEventBus.emit('room:event:player_join', {
            seat,
            player: user,
            roomNumber,
            room
          })
        } else {
          throw new Error('房间人数已满')
        }
      } else {
        throw new Error('房间人数已满')
      }
    }

    if (room.playing) {
      tryJoinAsOnlooker()
    } else {
      tryJoinAsPlayer()
    }

    // 推给用户房间信息
    sendToPlayer(
      {
        type: 'room:event:info',
        room
      },
      id
    )

    return {
      room
    }
  } else {
    throw new Error('房间不存在')
  }
}

/**
 * 房间内坐下
 * @param id
 * @param seat
 */
const sit = async (id: string, seat: number) => {
  const player = getPlayer(id)

  if (!player) throw new Error('玩家不存在')
  if (!checkPlayerIsInRoom(id)) throw new Error('当前不在房间内')

  const roomNumber = player.state.roomNumber!

  const user = await getUserData(id)
  const room = rooms.get(roomNumber)
  if (room) {
    if (room.playing) throw new Error('游戏中无法坐下')
    if (room.players[seat] === null) {
      if (!room.seats[seat]) throw new Error('房主关掉了这个坑位')
      // 从旁观者列表移除
      room.onlookers.splice(
        room.onlookers.findIndex((p) => p.id === id),
        1
      )
      // 设置 players（座位）为此玩家
      room.players[seat] = user
      // 更新玩家和房间状态
      updatePlayerState(id, roomNumber, false)
      updateRoom(roomNumber, room)
      // @TODO: 广播旁观者坐下事件
      sendToAllPlayer({
        type: 'room:event:onlooker_sit',
        from: roomNumber,
        seat,
        player: user
      })

      roomEventBus.emit('room:event:onlooker_sit', {
        seat,
        player: user,
        roomNumber,
        room
      })
    } else {
      throw new Error('这个坑位有人了')
    }
  } else {
    throw new Error('房间不存在')
  }
}

/**
 * 座位开启/关闭
 * @param roomNumber 房间号
 * @param seat 座位号
 * @param open 开关状态
 * @param id 房主玩家 ID
 */
const seatSwitch = (roomNumber: number, seat: number, open: boolean, id: string) => {
  const room = rooms.get(roomNumber)
  if (room) {
    if (room.owner !== id) throw new Error('你不是房主')
    if (room.players[seat] !== null) throw new Error('此坑位存在玩家，无法调整')

    room.seats[seat] = open
    updateRoom(roomNumber, room)

    // 广播坑位切换事件
    sendToAllPlayer({
      type: 'room:event:seat_switch',
      from: roomNumber,
      seat,
      open
    })

    return {
      roomNumber,
      seat,
      open
    }
  } else {
    throw new Error('房间不存在')
  }
}

const changePassword = (roomNumber: number, password: string, id: string) => {
  const room = rooms.get(roomNumber)
  if (room) {
    if (room.owner !== id) throw new Error('你不是房主')

    const pwd = password.trim().substring(0, 16)

    if (password !== '') {
      room.options.password = pwd
      room.locked = true
    } else {
      room.options.password = ''
      room.locked = false
    }

    updateRoom(roomNumber, room)

    // 广播房间锁定状态变更事件
    sendToAllPlayer({
      type: 'room:event:locked_state_change',
      from: roomNumber,
      locked: room.locked
    })

    // 向房间内的玩家广播密码变更事件
    sendToRoom(
      {
        type: 'room:event:password_change',
        roomNumber,
        password,
        locked: room.locked
      },
      roomNumber
    )

    return {
      roomNumber,
      locked: room.locked,
      password
    }
  }
}

/**
 * 发送广播
 * @param id 发起用户 ID
 */
const broadcast = async (id: string) => {
  const player = getPlayer(id)
  if (!player) throw new Error('用户不存在')
  if (!checkPlayerIsInRoom(id)) throw new Error('你必须在房间中才能发送房间广播')

  const roomNumber = player.state.roomNumber!
  const room = getRoom(roomNumber)
  if (!room) throw new Error('房间不存在')

  const appConfig = await getAppConfig()
  const intervalTime = appConfig.game.room.time.broadcastIntervalTimeSecond

  const now = Math.floor(Date.now() / 1000)
  const expAt = now + intervalTime

  // 防止重复广播（按房间冷却）
  const existing = broadcastRecord.get(roomNumber)
  if (existing && existing.expAt > now) {
    const remain = existing.expAt - now
    throw new Error(`广播过于频繁，请 ${remain} 秒后再试`)
  }

  // 记录冷却
  broadcastRecord.set(roomNumber, { expAt })
  setTimeout(() => {
    broadcastRecord.delete(roomNumber)
  }, intervalTime * 1000)

  // 构造消息（expAt 毫秒时间戳）
  const msg = {
    from: roomNumber,
    roomNumber,
    password: room.options.password,
    sender: await getUserData(id),
    expAt: expAt * 1000, // 前端一般用到毫秒
    timestamp: Date.now()
  }

  // 广播
  // @TODO: 这里可以只发送给大厅与房间内（排除游戏中的房间）
  sendToAllPlayer({ type: 'room:event:broadcast', ...msg })

  return msg
}

/**
 * 邀请玩家
 * @TODO 完善邀请的接收、拒绝状态功能
 * @param id 发起用户 ID
 * @param toId 被邀请用户 Id
 */
const invite = async (id: string, toId: string) => {
  const player = getPlayer(id)
  if (!player) throw new Error('用户不存在')

  if (!checkPlayerIsInRoom(id)) throw new Error('你必须在房间中才能邀请其他玩家')

  const roomNumber = player.state.roomNumber!
  const room = getRoom(roomNumber)
  if (!room) throw new Error('房间不存在')

  const appConfig = await getAppConfig()
  const expSeconds = appConfig.game.room.time.invitationValidTimeSecond
  const now = Math.floor(Date.now() / 1000)
  const expAt = now + expSeconds

  // 检查目标玩家
  if (!checkPlayerIsInLobby(toId)) {
    throw new Error('该玩家不在大厅')
  }

  // 防止重复邀请
  const key = `${id}:${toId}`
  const existing = inviteRecord.get(key)
  if (existing && existing.expAt > now) {
    const remain = existing.expAt - now
    throw new Error(`已邀请该玩家，请 ${remain} 秒后再试`)
  }

  // 记录邀请状态
  inviteRecord.set(key, { expAt })
  // 清理过期记录
  setTimeout(() => {
    inviteRecord.delete(key)
  }, expSeconds * 1000)

  const msg = {
    from: await getUserData(id),
    to: await getUserData(toId),
    roomNumber,
    password: room.options.password,
    duration: 20, // toast 显示时间（秒）
    expAt: expAt * 1000 // 过期时间（Unix 时间戳毫秒）
  }

  // 广播邀请
  sendToPlayer({ type: 'room:event:invite', ...msg }, toId)

  logger.debug(`玩家 ${id} 邀请了 ${toId} 加入房间 ${roomNumber}，有效期 ${expSeconds} 秒`)

  return msg
}

/**
 * 开始游戏
 * @param id
 * @param roomNumber
 */
const start = async (id: string, roomNumber?: number) => {
  const player = getPlayer(id)
  if (player) {
    const rn = player.state.roomNumber ?? roomNumber
    if (typeof rn !== 'undefined' && checkPlayerIsInRoom(player.id)) {
      const room = getRoom(rn)!
      if (!room.playing) {
        room.playing = true
        updateRoom(rn, room)

        const msg = {
          type: 'room:event:stage_update',
          from: rn,
          playing: true
        }

        sendToAllPlayer(msg)

        roomEventBus.emit('room:event:game_start', {
          roomNumber: rn,
          room
        })
      }
    }
  }
}

/**
 * 结束游戏
 * @param roomNumber
 */
const end = (roomNumber: number) => {
  const room = getRoom(roomNumber)
  if (room) {
    if (room.playing) {
      room.playing = false
      updateRoom(roomNumber, room)

      const msg = {
        type: 'room:event:stage_update',
        from: roomNumber,
        playing: false
      }

      sendToAllPlayer(msg)

      roomEventBus.emit('room:event:game_end', {
        roomNumber,
        room
      })
    }
  }
}

/**
 * 离开房间（玩家和旁观玩家通用），主动调用
 * @param id 用户 ID
 * @param roomNumber 房间号，默认为提供的用户的状态中保存的房间号
 */
const leaveRoom = (id: string, roomNumber?: number) => {
  if (!checkPlayerIsInRoom(id)) throw new Error('当前不在房间内')

  const rn = roomNumber || getPlayer(id)?.state.roomNumber || 0
  const room = rooms.get(rn)
  if (room) {
    removeRoomPlayer(rn, id)
  }

  return {
    roomNumber: rn
  }
}

/**
 * 移除房间内的用户
 * @param roomNumber 房间号
 * @param id 用户 ID
 */
const removeRoomPlayer = async (roomNumber: number, id: string) => {
  const room = rooms.get(roomNumber)
  const player = await getUserData(id)
  if (room) {
    const seat = room.players.findIndex((p) => p?.id === id)
    const onlookersIndex = room.onlookers.findIndex((p) => p?.id === id)

    if (seat < 0 && onlookersIndex < 0) {
      throw new Error('当前玩家不在房间内')
    }

    // 先移除玩家（再计算剩余玩家数量，避免状态不一致）
    if (seat > -1) {
      room.players[seat] = null
    } else if (onlookersIndex > -1) {
      room.onlookers.splice(onlookersIndex, 1)
    }

    const realPlayers = room.players.filter((p) => p !== null)

    // 判断玩家在坑里，还是在树上
    if (seat > -1) {
      // 广播玩家（从坑位）离开房间事件
      sendToAllPlayer({
        type: 'room:event:player_leave',
        from: roomNumber,
        seat,
        player
      })

      roomEventBus.emit('room:event:player_leave', {
        seat,
        player,
        roomNumber,
        room
      })
    } else if (onlookersIndex > -1) {
      // 广播玩家（从树上）离开房间事件
      sendToAllPlayer({
        type: 'room:event:onlooker_leave',
        from: roomNumber,
        onlookersIndex,
        player
      })

      roomEventBus.emit('room:event:onlooker_leave', {
        player,
        roomNumber,
        room
      })
    }

    // 如果房间无其他玩家，则解散房间
    if (realPlayers.length === 0) {
      destroyRoom(room.roomNumber)
      updatePlayerState(id) // 这里有个时序先后问题，所以先销毁房间，再更新玩家状态，避免出现闪烁
      return
    }

    // 如果玩家是房主且仍有其他玩家，则更改房主为相邻玩家
    if (room.owner === id && seat > -1 && realPlayers.length > 0) {
      let newOwnerIndex = -1

      // 向后找最近的非空座位
      for (let i = seat + 1; i < room.players.length; i++) {
        if (room.players[i]) {
          newOwnerIndex = i
          break
        }
      }

      // 如果后面没有，则向前找
      if (newOwnerIndex === -1) {
        for (let i = seat - 1; i >= 0; i--) {
          if (room.players[i]) {
            newOwnerIndex = i
            break
          }
        }
      }

      const newOwner = room.players[newOwnerIndex]
      if (newOwner) {
        room.owner = newOwner.id
        // 广播房主变更事件
        sendToAllPlayer({
          type: 'room:event:owner_change',
          from: roomNumber,
          id: newOwner.id
        })
      } else {
        // 理论上不会发生，保险起见
        room.owner = ''
      }
    }

    // 如果玩家在房间内，则更新玩家状态至“不在房间内”
    // 这里同上面的销毁逻辑一样，有个时序先后问题，所以处理离场事件，再更新玩家状态
    if (seat > -1 || onlookersIndex > -1) {
      updatePlayerState(id)
    }

    updateRoom(roomNumber, room)
  }
}

export {
  roomEventBus,
  getRoom,
  getRoomList,
  createRoom,
  destroyRoom,
  joinRoom,
  sit,
  seatSwitch,
  changePassword,
  broadcast,
  invite,
  start,
  end,
  leaveRoom,
  removeRoomPlayer
}
