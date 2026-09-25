/**
 * 玩家生命周期管理、状态同步与连接维护
 * @author Winter <littlewiinter@gmail.com>
 */

import { colors } from 'consola/utils'
import mitt from 'mitt'
import { isOpen, reply, safeSend, type WsPeer } from '~~/server/ws/utils'
import { wsEventBus } from '~~/server/ws/core/events'
import {
  roomTopic,
  subscribePeerToChannel,
  unsubscribePeerFromChannel
} from '~~/server/ws/core/channel'
import { sendToChannel } from '~~/server/ws/core/sender'
import { updateUserLastLoginAt } from './user'

import { createLogger } from '~~/server/utils/logger'

interface ServerPlayer extends LoggedInPlayer {
  peer: WsPeer
}

type PlayerEventBus = {
  'player:connect': {
    player: ServerPlayer
    reply: <T>(msg: WebsocketMessage<T>) => void
  }
  'player:beforeDisconnect': {
    player: Omit<ServerPlayer, 'peer'>
  }
  'player:disconnected': {
    player: Omit<ServerPlayer, 'peer'>
  }
}

const logger = createLogger('PlayerService')

// ------------------------- Records -------------------------
/**
 * 所有玩家
 */
const players = new Map<string, ServerPlayer>()

/**
 * 事件总线
 */
const playerEventBus = mitt<PlayerEventBus>()

// ------------------------ WS Events ------------------------
wsEventBus.on('ws:connect', async ({ peer, user, reply }) => {
  if (user) {
    checkDuplicateLogin(user.id)
    const player = { ...user, peer }
    await addPlayer(player)
  }
})
wsEventBus.on('ws:error', ({ user }) => {
  if (user) {
    removePlayer(user.id)
  }
})
wsEventBus.on('ws:disconnect', ({ user, code }) => {
  // 这里判断 code 不为 4001 时才移除实例是因为 checkDuplicateLogin 函数里已经移除过一次了
  // 而检测到重复登录时候，事件触发顺序为：(旧连接调用)peer.close -> (新连接触发)open -> (新连接调用)addPlayer -> (旧连接触发)ws:disconnect
  // 旧玩家的的连接触发 'ws:disconnect' 时机会晚于新玩家连接的 'ws:connect'
  // 在此处再移除一次，则会把新连接刚刚添加进来的（新连接的） ServerPlayer 实例移除，导致 bug，真他喵绕
  if (user && code !== 4001) {
    removePlayer(user.id)
  }
})

// ------------------------ Actions ------------------------
const getPlayer = (playerId: string) => players.get(playerId)

/**
 * 检查是否重复登录，并关掉先前的连接
 * @param playerId 玩家 ID
 */
const checkDuplicateLogin = (playerId: string) => {
  const isLoginedPlayer = getPlayer(playerId)
  if (isLoginedPlayer) {
    logger.warn(`重复登录检测: ${colors.cyan(playerId)}，踢出旧连接`)
    removePlayer(isLoginedPlayer.id) // 重复登录时移除旧玩家状态
    isLoginedPlayer.peer.close(4001, 'Duplicate login')
  }
}

/**
 * 检查玩家是否在房间内
 * @param playerId 玩家 ID
 */
const checkPlayerIsInRoom = (playerId: string) => {
  return getPlayer(playerId)?.state.presence === 'inRoom' && getPlayer(playerId)?.state.roomId !== null
}

/**
 * 检查玩家是否在大厅内
 * @param playerId 玩家 ID
 */
const checkPlayerIsInLobby = (playerId: string) => {
  return getPlayer(playerId)?.state.presence === 'lobby'
}

/**
 * 获取所有在大厅的玩家
 */
const getLobbyPlayers = () => {
  return Array.from(players.values(), (p) => {
    return {
      ...p,
      state: undefined, // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
      peer: undefined // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
    }
  }).filter((p) => checkPlayerIsInLobby(p.id))
}

const addPlayer = async (user: UserData & { peer: WsPeer }) => {
  const player: ServerPlayer = {
    ...user,
    state: {
      presence: 'lobby',
      roomNumber: null,
      roomId: null,
      isOnlooker: false
    }
  }
  players.set(user.id, player)
  await updateUserLastLoginAt(user.id) // 更新玩家最后登录时间

  logger.debug('玩家上线:', `${colors.cyan(player.nickname)}@${player.id}`)

  playerEventBus.emit('player:connect', {
    player,
    reply: reply(player.peer)
  })

  sendToPlayer(
    {
      type: 'player:event:logged_in',
      player: {
        ...player,
        peer: undefined // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
      }
    },
    user.id
  )
  updatePlayerState(user.id)
}

/**
 * 更新玩家状态
 * @param playerId 玩家 ID
 * @param opts 房间上下文（由调用方传入，玩家服务不反查房间）
 * @param opts.roomId 所在房间 ID，未提供则为在大厅
 * @param opts.roomNumber 所在房间号，进房时由房间侧传入
 * @param opts.isOnlooker 是否旁观
 */
const updatePlayerState = (
  playerId: string,
  opts?: {
    roomId?: string
    roomNumber?: number
    isOnlooker?: boolean
  }
) => {
  const player = players.get(playerId)
  if (player) {
    const { roomId, roomNumber, isOnlooker } = opts ?? {}
    const prevRoomId = player.state.roomId
    // 换房/离房时先退订旧房间频道（同房角色切换 prevRoomId === roomId 时不动）
    if (prevRoomId && prevRoomId !== roomId) {
      unsubscribePeerFromChannel(player.peer, roomTopic(prevRoomId))
    }

    if (typeof roomId === 'undefined' || roomId === '') {
      player.state.presence = 'lobby'
      player.state.roomNumber = null
      player.state.roomId = null
      player.state.isOnlooker = false
      // 广播：添加此玩家到大厅列表
      sendToAllPlayer({
        type: 'player:event:lobby_join',
        player: {
          ...player,
          state: undefined, // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
          peer: undefined // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
        }
      })
    } else {
      player.state.presence = 'inRoom'
      player.state.roomNumber = roomNumber ?? null
      player.state.roomId = roomId
      player.state.isOnlooker = isOnlooker ?? false
      // 进入新房间时订阅房间频道（同房角色切换时 Set 幂等，重复订阅无副作用）
      if (prevRoomId !== roomId) {
        subscribePeerToChannel(player.peer, roomTopic(roomId))
      }
      // 广播：从大厅玩家列表移除此玩家
      sendToAllPlayer({
        type: 'player:event:lobby_leave',
        player: {
          ...player,
          state: undefined, // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
          peer: undefined // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
        }
      })
    }

    players.set(playerId, player)

    sendToPlayer(
      {
        type: 'player:event:state_update',
        id: playerId,
        state: player.state
      },
      playerId
    )

    logger.debug('玩家状态更新:', `${colors.cyan(player?.nickname)}@${player.id}`)
  }
}

const removePlayer = (playerId: string) => {
  const player = getPlayer(playerId)
  if (player) {
    // @TODO: 这里玩家的连接已经 close，为了安全起见，应该不要在后续处理过程中还存在这个东西，防止错误访问
    // @TODO: 但是这里暂时先用 Omit<ServerPlayer, 'peer'> 把 ServerPlayer 类型的 peer 属性移除（并未在真实对象中移除掉）
    // delete player.peer
    playerEventBus.emit('player:beforeDisconnect', {
      player
    })

    players.delete(playerId)

    // 这里需要一前一后两个钩子，因为有些时候需要用到旧状态
    playerEventBus.emit('player:disconnected', {
      player
    })

    logger.debug('玩家离线:', `${colors.cyan(player?.nickname)}@${player.id}`)
  }
}

// ------------------------ Sender ------------------------
const sendToPlayer = <T>(msg: WebsocketMessage<T>, playerId: string | string[]) => {
  const ids = Array.isArray(playerId) ? playerId : [playerId]
  const encoded = {
    ...msg,
    _scope: 'player'
  }

  for (const pid of ids) {
    const p = players.get(pid)
    if (p && isOpen(p.peer)) safeSend(p.peer, encoded)
  }
}

const sendToAllPlayer = <T>(msg: WebsocketMessage<T>) => {
  const encoded = {
    ...msg,
    _scope: 'all'
  }

  players.forEach((p) => safeSend(p.peer, encoded))
}

const sendToRoom = <T>(msg: WebsocketMessage<T>, roomId: string, excludePlayerIds?: string[]) => {
  const encoded = {
    ...msg,
    _scope: 'room'
  }

  // 走 channel 订阅广播，复杂度 O(房间内) 而非 O(全服)
  let excludePeers: Set<WsPeer> | undefined
  if (excludePlayerIds?.length) {
    excludePeers = new Set()
    for (const pid of excludePlayerIds) {
      const p = players.get(pid)
      if (p) excludePeers.add(p.peer)
    }
  }

  sendToChannel(encoded, roomTopic(roomId), { excludePeers })
}

const sendToLobby = <T>(msg: WebsocketMessage<T>) => {
  const encoded = {
    ...msg,
    _scope: 'lobby'
  }

  players.forEach((p) => {
    if (checkPlayerIsInLobby(p.id)) {
      safeSend(p.peer, encoded)
    }
  })
}

export {
  type ServerPlayer,
  playerEventBus,
  players,
  getPlayer,
  getLobbyPlayers,
  checkPlayerIsInRoom,
  checkPlayerIsInLobby,
  updatePlayerState,
  sendToPlayer,
  sendToAllPlayer,
  sendToRoom,
  sendToLobby
}
