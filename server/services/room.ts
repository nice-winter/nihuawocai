/**
 * 房间创建/加入/退出与房主转移逻辑
 * @author Winter <littlewiinter@gmail.com>
 */

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

import { createLogger } from '~~/server/utils/logger'

type RoomEventBus = {
  'room:event:create': {
    roomId: string
    room: Room
  }
  'room:event:destroy': {
    roomId: string
    roomNumber: number
  }
  'room:event:player_join': {
    seat: number
    player: UserData
    roomId: string
    room: Room
  }
  'room:event:player_leave': {
    seat: number
    player: UserData
    roomId: string
    room: Room
  }
  'room:event:onlooker_join': {
    player: UserData
    roomId: string
    room: Room
  }
  'room:event:onlooker_sit': {
    seat: number
    player: UserData
    roomId: string
    room: Room
  }
  'room:event:onlooker_leave': {
    player: UserData
    roomId: string
    room: Room
  }
  'room:event:game_start': {
    roomId: string
    room: Room
  }
  'room:event:game_end': {
    roomId: string
    room: Room
  }
}

const logger = createLogger('RoomService')

// ------------------------- Records -------------------------
/**
 * 事件总线
 */
const roomEventBus = mitt<RoomEventBus>()

/**
 * 所有房间，键为 room.id（内部身份键）
 */
const rooms = new Map<string, Room>()

/**
 * 玩家邀请记录
 */
const inviteRecord = new Map<string, { expAt: number }>()

/**
 * 房间广播记录，键为 room.id
 */
const broadcastRecord = new Map<string, { expAt: number }>()

// ---------------------- Player Events ----------------------
// 延迟初始化事件监听，避免循环依赖
const initPlayerEvents = () => {
  // playerEventBus.on('player:connect', ({ player }) => {
  //   // @TODO: 暂时没用上
  // })

  // 玩家离线时，从他所在的房间中移除他
  playerEventBus.on('player:beforeDisconnect', ({ player }) => {
    if (checkPlayerIsInRoom(player.id)) {
      removeRoomPlayer(player.state.roomId!, player.id)
    }
  })
}

// 延迟执行，确保所有模块都已加载
setTimeout(initPlayerEvents, 0)

// ------------------------ Actions ------------------------
/**
 * 按身份 ID 获取房间
 * @param roomId 房间 ID
 */
const getRoom = (roomId: string) => {
  return rooms.get(roomId)
}

/**
 * 按房间号获取房间（房间号会回收复用，仅用于加入解析等用户句柄场景）
 * @param roomNumber 房间号
 */
const getRoomByNumber = (roomNumber: number) => {
  return [...rooms.values()].find((r) => r.roomNumber === roomNumber)
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
 * 注意：rooms 的键是 room.id，必须从 values() 收集已占用的房间号来探洞
 */
const getNextRoomNumber = () => {
  const used = new Set([...rooms.values()].map((r) => r.roomNumber))
  return Array.from({ length: used.size + 1 }, (_, i) => i).find((i) => !used.has(i))!
}

/**
 * 创建房间
 * @param ownerId 房主 ID
 * @param openSeatCount 默认坑位数量（0~6）；0 为全关，6 为全开，并且始终有一个坑位给房主
 * @param options 房间设置
 * @param config 房间自己的配置（如果有），这会覆盖全局应用配置中的房间配置
 */
const createRoom = async (
  ownerId: string,
  openSeatCount?: number,
  options?: Partial<RoomOptions>,
  config?: Partial<RoomConfig>
) => {
  const user = await getUserData(ownerId)

  if (checkPlayerIsInRoom(ownerId)) throw new Error('当前已在房间内')

  const defaultRoomOptions: RoomOptions = {
    password: '',
    maxOnlookers: 5,
    libIds: []
  }

  const roomOptions: RoomOptions = defu(options, defaultRoomOptions),
    roomConfig = config ?? null,
    roomNumber = getNextRoomNumber(),
    seatOpenFlags = Array.from({ length: 7 }, (_, i) => i === 0 || i <= (openSeatCount || 0)),
    locked = roomOptions.password.trim() !== ''

  const room: Room = {
    id: nanoid(),
    options: roomOptions,
    config: roomConfig,
    roomNumber,
    ownerId,
    seatOpenFlags,
    locked,
    players: new Array(7).fill(null),
    onlookers: [],
    playing: false,
    createdById: ownerId,
    createdAt: Date.now()
  }

  rooms.set(room.id, room)

  // 把房主加入房间
  await joinRoom(room.id, ownerId, roomOptions.password)

  // 向所有人推送新的房间信息
  // @TODO: 需要过滤不需要的字段
  const roomInfo: RoomInfo = roomPropertyFilter(getRoom(room.id)!)

  // 广播房间创建事件
  sendToAllPlayer({
    type: 'room:event:create',
    roomId: room.id,
    roomNumber,
    room: roomInfo
  })

  roomEventBus.emit('room:event:create', {
    roomId: room.id,
    room: getRoom(room.id)!
  })

  logger.info(
    `房间 ${colors.cyan('#' + room.roomNumber)} 已创建，房主`,
    `${colors.cyan(user.nickname)}@${user.id}`,
    `at ${colors.gray(new Date().toLocaleString())}`
  )

  return {
    room: getRoom(room.id)
  }
}

/**
 * 销毁房间，当前房间内的玩家会逐个更新为“不在房间内”状态
 * @param roomId 房间 ID
 */
const destroyRoom = (roomId: string) => {
  const room = rooms.get(roomId)
  if (room) {
    rooms.delete(roomId)
    // 广播房间销毁事件
    sendToAllPlayer({
      type: 'room:event:destroy',
      roomNumber: room.roomNumber,
      roomId: room.id
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
      roomId: room.id,
      roomNumber: room.roomNumber
    })

    logger.info(
      `房间 ${colors.cyan('#' + room.roomNumber)} 已销毁，at ${colors.gray(
        new Date().toLocaleString()
      )}`
    )
  }
}

/**
 * 更新房间
 * @param roomId 房间 ID
 * @param room
 */
const updateRoom = (roomId: string, room: Room) => {
  if (room.players.length !== 7) throw new Error('房间信息错误')
  rooms.set(roomId, room)
}

const joinRoom = async (roomId: string, playerId: string, password?: string) => {
  if (checkPlayerIsInRoom(playerId)) throw new Error('当前已在房间内')

  const room = rooms.get(roomId)
  const user = await getUserData(playerId)

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
        updateRoom(roomId, room)
        updatePlayerState(user.id, roomId, true)
        // 广播旁观者进房事件
        sendToAllPlayer({
          type: 'room:event:onlooker_join',
          roomId: room.id,
          roomNumber: room.roomNumber,
          player: user
        })

        roomEventBus.emit('room:event:onlooker_join', {
          roomId,
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
      if (room.seatOpenFlags.filter((s) => s).length > room.players.filter((p) => p).length) {
        // 查找第一个没有玩家且呈打开状态的坑位索引号
        const seat = room.players.findIndex((i, index) => i === null && room.seatOpenFlags[index] === true)
        // 判断是否已找到索引，找不到就是说明所有坑位不是有人就是被关掉了
        if (seat > -1) {
          room.players[seat] = user // 坐到当前坑位
          // 更新房间和玩家状态
          updateRoom(roomId, room)
          updatePlayerState(user.id, roomId)
          // 广播玩家进房事件
          sendToAllPlayer({
            type: 'room:event:player_join',
            roomId: room.id,
            roomNumber: room.roomNumber,
            seat,
            player: user
          })

          roomEventBus.emit('room:event:player_join', {
            seat,
            player: user,
            roomId,
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
    // TODO: info 携带真实密码，create 走 roomPropertyFilter 打码，安全口径待统一
    sendToPlayer(
      {
        type: 'room:event:info',
        roomId: room.id,
        roomNumber: room.roomNumber,
        room
      },
      playerId
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
 * @param playerId 玩家 ID
 * @param seat 座位号
 */
const sit = async (playerId: string, seat: number) => {
  const player = getPlayer(playerId)

  if (!player) throw new Error('玩家不存在')
  if (!checkPlayerIsInRoom(playerId)) throw new Error('当前不在房间内')

  const roomId = player.state.roomId!

  const user = await getUserData(playerId)
  const room = rooms.get(roomId)
  if (room) {
    if (room.playing) throw new Error('游戏中无法坐下')
    if (room.players[seat] === null) {
      if (!room.seatOpenFlags[seat]) throw new Error('房主关掉了这个坑位')
      // 从旁观者列表移除
      room.onlookers.splice(
        room.onlookers.findIndex((p) => p.id === playerId),
        1
      )
      // 设置 players（座位）为此玩家
      room.players[seat] = user
      // 更新玩家和房间状态
      updatePlayerState(playerId, roomId, false)
      updateRoom(roomId, room)
      // @TODO: 广播旁观者坐下事件
      sendToAllPlayer({
        type: 'room:event:onlooker_sit',
        roomId: room.id,
        roomNumber: room.roomNumber,
        seat,
        player: user
      })

      roomEventBus.emit('room:event:onlooker_sit', {
        seat,
        player: user,
        roomId,
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
 * 座位开启/关闭（房间从操作者状态反查，不信任客户端传入的房间标识）
 * @param playerId 房主玩家 ID
 * @param seat 座位号
 * @param isOpen 开关状态
 */
const setSeatOpen = (playerId: string, seat: number, isOpen: boolean) => {
  const roomId = getPlayer(playerId)?.state.roomId
  if (!roomId) throw new Error('当前不在房间内')

  const room = rooms.get(roomId)
  if (room) {
    if (room.ownerId !== playerId) throw new Error('你不是房主')
    if (room.players[seat] !== null) throw new Error('此坑位存在玩家，无法调整')

    room.seatOpenFlags[seat] = isOpen
    updateRoom(roomId, room)

    // 广播坑位切换事件
    sendToAllPlayer({
      type: 'room:event:seat_open_change',
      roomId: room.id,
      roomNumber: room.roomNumber,
      seat,
      isOpen
    })

    return {
      roomId: room.id,
      roomNumber: room.roomNumber,
      seat,
      isOpen
    }
  } else {
    throw new Error('房间不存在')
  }
}

/**
 * 修改房间密码（房间从操作者状态反查，不信任客户端传入的房间标识）
 * @param playerId 房主玩家 ID
 * @param password 新密码
 */
const changePassword = (playerId: string, password: string) => {
  const roomId = getPlayer(playerId)?.state.roomId
  if (!roomId) throw new Error('当前不在房间内')

  const room = rooms.get(roomId)
  if (room) {
    if (room.ownerId !== playerId) throw new Error('你不是房主')

    const pwd = password.trim().substring(0, 16)

    if (password !== '') {
      room.options.password = pwd
      room.locked = true
    } else {
      room.options.password = ''
      room.locked = false
    }

    updateRoom(roomId, room)

    logger.debug(`房间密码变更: 房间 ${colors.cyan('#' + room.roomNumber)}，操作者 ${colors.cyan(playerId)}，锁定 ${room.locked}`)

    // 广播房间锁定状态变更事件
    sendToAllPlayer({
      type: 'room:event:locked_state_change',
      roomId: room.id,
      roomNumber: room.roomNumber,
      locked: room.locked
    })

    // 向房间内的玩家广播密码变更事件
    sendToRoom(
      {
        type: 'room:event:password_change',
        roomId: room.id,
        roomNumber: room.roomNumber,
        password,
        locked: room.locked
      },
      roomId
    )

    return {
      roomId: room.id,
      roomNumber: room.roomNumber,
      locked: room.locked,
      password
    }
  }
}

/**
 * 发送广播
 * @param playerId 发起玩家 ID
 */
const broadcast = async (playerId: string) => {
  const player = getPlayer(playerId)
  if (!player) throw new Error('用户不存在')
  if (!checkPlayerIsInRoom(playerId)) throw new Error('你必须在房间中才能发送房间广播')

  const roomId = player.state.roomId!
  const room = getRoom(roomId)
  if (!room) throw new Error('房间不存在')

  const appConfig = await getAppConfig()
  const intervalTime = appConfig.game.room.time.broadcastIntervalTimeSecond

  const now = Math.floor(Date.now() / 1000)
  const expAt = now + intervalTime

  // 防止重复广播（按房间冷却）
  const existing = broadcastRecord.get(roomId)
  if (existing && existing.expAt > now) {
    const remain = existing.expAt - now
    throw new Error(`广播过于频繁，请 ${remain} 秒后再试`)
  }

  // 记录冷却
  broadcastRecord.set(roomId, { expAt })
  setTimeout(() => {
    broadcastRecord.delete(roomId)
  }, intervalTime * 1000)

  // 构造消息（expAt 毫秒时间戳）
  const msg = {
    roomNumber: room.roomNumber,
    roomId: room.id,
    password: room.options.password,
    sender: await getUserData(playerId),
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
 * @param playerId 发起玩家 ID
 * @param targetId 被邀请玩家 ID
 */
const invite = async (playerId: string, targetId: string) => {
  const player = getPlayer(playerId)
  if (!player) throw new Error('用户不存在')

  if (!checkPlayerIsInRoom(playerId)) throw new Error('你必须在房间中才能邀请其他玩家')

  const roomId = player.state.roomId!
  const room = getRoom(roomId)
  if (!room) throw new Error('房间不存在')

  const appConfig = await getAppConfig()
  const expSeconds = appConfig.game.room.time.invitationValidTimeSecond
  const now = Math.floor(Date.now() / 1000)
  const expAt = now + expSeconds

  // 检查目标玩家
  if (!checkPlayerIsInLobby(targetId)) {
    throw new Error('该玩家不在大厅')
  }

  // 防止重复邀请
  const key = `${playerId}:${targetId}`
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
    sender: await getUserData(playerId),
    target: await getUserData(targetId),
    roomNumber: room.roomNumber,
    roomId: room.id,
    password: room.options.password,
    duration: 20, // toast 显示时间（秒）
    expAt: expAt * 1000 // 过期时间（Unix 时间戳毫秒）
  }

  // 广播邀请
  sendToPlayer({ type: 'room:event:invite', ...msg }, targetId)

  logger.debug(`玩家 ${playerId} 邀请了 ${targetId} 加入房间 ${room.roomNumber}，有效期 ${expSeconds} 秒`)

  return msg
}

/**
 * 开始游戏
 * @param playerId 发起玩家 ID
 */
const start = async (playerId: string) => {
  const player = getPlayer(playerId)
  if (player) {
    const roomId = player.state.roomId ?? undefined
    if (typeof roomId !== 'undefined' && checkPlayerIsInRoom(player.id)) {
      const room = getRoom(roomId)!
      if (!room.playing) {
        room.playing = true
        updateRoom(roomId, room)

        logger.info(`游戏开始: 房间 ${colors.cyan('#' + room.roomNumber)}，发起者 ${colors.cyan(playerId)}`)

        const msg = {
          type: 'room:event:stage_update',
          roomId: room.id,
          roomNumber: room.roomNumber,
          playing: true
        }

        sendToAllPlayer(msg)

        roomEventBus.emit('room:event:game_start', {
          roomId,
          room
        })
      }
    }
  }
}

/**
 * 结束游戏
 * @param roomId 房间 ID
 */
const end = (roomId: string) => {
  const room = getRoom(roomId)
  if (room) {
    if (room.playing) {
      room.playing = false
      updateRoom(roomId, room)

      logger.info(`游戏结束: 房间 ${colors.cyan('#' + room.roomNumber)}`)

      const msg = {
        type: 'room:event:stage_update',
        roomId: room.id,
        roomNumber: room.roomNumber,
        playing: false
      }

      sendToAllPlayer(msg)

      roomEventBus.emit('room:event:game_end', {
        roomId,
        room
      })
    }
  }
}

/**
 * 离开房间（玩家和旁观玩家通用），主动调用
 * @param playerId 玩家 ID
 */
const leaveRoom = (playerId: string) => {
  if (!checkPlayerIsInRoom(playerId)) throw new Error('当前不在房间内')

  const roomId = getPlayer(playerId)?.state.roomId
  if (!roomId) return { roomId: '', roomNumber: 0 }

  // 先读 roomNumber：removeRoomPlayer 可能触发房间销毁
  const roomNumber = getRoom(roomId)?.roomNumber ?? 0
  removeRoomPlayer(roomId, playerId)

  return {
    roomId,
    roomNumber
  }
}

/**
 * 移除房间内的用户
 * @param roomId 房间 ID
 * @param playerId 玩家 ID
 */
const removeRoomPlayer = async (roomId: string, playerId: string) => {
  const room = rooms.get(roomId)
  const player = await getUserData(playerId)
  if (room) {
    const seat = room.players.findIndex((p) => p?.id === playerId)
    const onlookersIndex = room.onlookers.findIndex((p) => p?.id === playerId)

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
        roomId: room.id,
        roomNumber: room.roomNumber,
        seat,
        player
      })

      roomEventBus.emit('room:event:player_leave', {
        seat,
        player,
        roomId,
        room
      })
    } else if (onlookersIndex > -1) {
      // 广播玩家（从树上）离开房间事件
      sendToAllPlayer({
        type: 'room:event:onlooker_leave',
        roomId: room.id,
        roomNumber: room.roomNumber,
        player
      })

      roomEventBus.emit('room:event:onlooker_leave', {
        player,
        roomId,
        room
      })
    }

    // 如果房间无其他玩家，则解散房间
    if (realPlayers.length === 0) {
      destroyRoom(room.id)
      updatePlayerState(playerId) // 这里有个时序先后问题，所以先销毁房间，再更新玩家状态，避免出现闪烁
      return
    }

    // 如果玩家是房主且仍有其他玩家，则更改房主为相邻玩家
    if (room.ownerId === playerId && seat > -1 && realPlayers.length > 0) {
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
        room.ownerId = newOwner.id
        // 广播房主变更事件
        sendToAllPlayer({
          type: 'room:event:owner_change',
          roomId: room.id,
          roomNumber: room.roomNumber,
          newOwnerId: newOwner.id
        })
      } else {
        // 理论上不会发生，保险起见
        logger.error(`严重异常: 房间 ${colors.cyan('#' + room.roomNumber)} 找不到有效新房主，数据一致性可能受损`)
        room.ownerId = ''
      }
    }

    // 如果玩家在房间内，则更新玩家状态至“不在房间内”
    // 这里同上面的销毁逻辑一样，有个时序先后问题，所以处理离场事件，再更新玩家状态
    if (seat > -1 || onlookersIndex > -1) {
      updatePlayerState(playerId)
    }

    updateRoom(roomId, room)
  }
}

/**
 * 快速匹配房间（快速开始）
 */
const quickMatch = async (playerId: string) => {
  const player = getPlayer(playerId)
  if (!player) throw new Error('玩家不存在')
  if (!checkPlayerIsInLobby(playerId)) throw new Error('你当前不在大厅')

  const rooms = getRoomList() // RoomInfo[]

  // 1. 筛选可加入房间
  const candidates = rooms.filter((room) => {
    if (room.locked) return false // 上锁 → 不可加入
    if (room.playing) return false // 正在游戏中 → 不可加入

    // 判断是否存在 “空位且启用的 seat”
    const hasValidSeat = room.players.some((p, idx) => {
      return p === null && room.seatOpenFlags[idx] === true
    })

    if (!hasValidSeat) return false

    return true
  })

  if (candidates.length === 0) {
    throw new Error('当前没有可加入的房间')
  }

  // 2. 随机选房
  const room = candidates[Math.floor(Math.random() * candidates.length)]!

  // 3. 加入房间
  try {
    // 返回完整加入结果（回包机制只展开 object，裸 number 会被吞掉）
    return await joinRoom(room.id, playerId)
  } catch (err) {
    throw new Error(`加入房间失败：${(err as Error).message}`, { cause: err })
  }
}

export {
  roomEventBus,
  getRoom,
  getRoomByNumber,
  getRoomList,
  createRoom,
  destroyRoom,
  joinRoom,
  sit,
  setSeatOpen,
  changePassword,
  broadcast,
  invite,
  start,
  end,
  leaveRoom,
  removeRoomPlayer,
  quickMatch
}
