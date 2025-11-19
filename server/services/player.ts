import { consola } from 'consola'
import { colors } from 'consola/utils'
import mitt from 'mitt'
import { isOpen, reply, safeSend, type WsPeer } from '~~/server/ws/utils'
import { wsEventBus } from '~~/server/ws'
import type { WebsocketMessage } from '#shared/interfaces/ws'
import type { UserData } from '#shared/interfaces/userData'
import type { LoggedInPlayer } from '#shared/interfaces/player'

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

const logger = consola.withTag('Player Service')

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
wsEventBus.on('ws:connect', ({ peer, user, reply }) => {
  if (user) {
    checkDuplicateLogin(user.id)
    const player = { ...user, peer }
    addPlayer(player)
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
const getPlayer = (id: string) => players.get(id)

/**
 * 检查是否重复登录，并关掉先前的连接
 * @param id
 */
const checkDuplicateLogin = (id: string) => {
  const isLoginedPlayer = getPlayer(id)
  if (isLoginedPlayer) {
    removePlayer(isLoginedPlayer.id) // 重复登录时移除旧玩家状态
    isLoginedPlayer.peer.close(4001, 'Duplicate login')
  }
}

/**
 * 检查玩家是否在房间内
 * @param id
 */
const checkPlayerIsInRoom = (id: string) => {
  return getPlayer(id)?.state.type === 'in_room' && getPlayer(id)?.state.roomNumber !== null
}

/**
 * 检查玩家是否在大厅内
 * @param id
 */
const checkPlayerIsInLobby = (id: string) => {
  return getPlayer(id)?.state.type === 'lobby'
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

const addPlayer = (user: UserData & { peer: WsPeer }) => {
  const player: ServerPlayer = {
    ...user,
    state: {
      type: 'lobby',
      roomNumber: null,
      onlooker: false
    }
  }
  players.set(user.id, player)

  logger.debug('Added new player:', `${colors.cyan(player.nickname)}@${player.id}`)

  playerEventBus.emit('player:connect', {
    player,
    reply: reply(player.peer)
  })

  sendToPlayer(
    {
      type: 'player:event:logged_in',
      player_info: {
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
 * @param id 用户 ID
 * @param roomNumber 所在房间号，未提供则为在大厅
 */
const updatePlayerState = (id: string, roomNumber?: number, onlooker?: boolean) => {
  const player = players.get(id)
  if (player) {
    if (typeof roomNumber === 'undefined' || roomNumber < 0) {
      player.state.type = 'lobby'
      player.state.roomNumber = null
      player.state.onlooker = false
      // 广播：添加此玩家到大厅列表
      sendToAllPlayer({
        type: 'player:event:lobby_players_add',
        player: {
          ...player,
          state: undefined, // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
          peer: undefined // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
        }
      })
    } else {
      player.state.type = 'in_room'
      player.state.roomNumber = roomNumber
      player.state.onlooker = onlooker ?? false
      // 广播：从大厅玩家列表移除此玩家
      sendToAllPlayer({
        type: 'player:event:lobby_players_remove',
        player: {
          ...player,
          state: undefined, // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
          peer: undefined // @TODO: 这里不要把 server runtime 的东西传出去，暂时偷懒这么写。。
        }
      })
    }

    players.set(id, player)

    sendToPlayer(
      {
        type: 'player:event:state_update',
        id,
        state: player.state,
        roomNumber
      },
      id
    )

    logger.debug('Player state updated:', `${colors.cyan(player?.nickname)}@${player.id}`)
  }
}

const removePlayer = (id: string) => {
  const player = getPlayer(id)
  if (player) {
    // @TODO: 这里玩家的连接已经 close，为了安全起见，应该不要在后续处理过程中还存在这个东西，防止错误访问
    // @TODO: 但是这里暂时先用 Omit<ServerPlayer, 'peer'> 把 ServerPlayer 类型的 peer 属性移除（并未在真实对象中移除掉）
    // delete player.peer
    playerEventBus.emit('player:beforeDisconnect', {
      player
    })

    players.delete(id)

    // 这里需要一前一后两个钩子，因为有些时候需要用到旧状态
    playerEventBus.emit('player:disconnected', {
      player
    })

    logger.debug('Removed player:', `${colors.cyan(player?.nickname)}@${player.id}`)
  }
}

// ------------------------ Sender ------------------------
const sendToPlayer = <T>(msg: WebsocketMessage<T>, id: string | string[]) => {
  const ids = Array.isArray(id) ? id : [id]
  const encoded = {
    ...msg,
    _scope: 'player'
  }

  for (const i of ids) {
    const p = players.get(i)
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

const sendToRoom = <T>(msg: WebsocketMessage<T>, roomNumber: number) => {
  const encoded = {
    ...msg,
    _scope: 'room'
  }

  players.forEach((p) => {
    if (p.state.type === 'in_room' && p.state.roomNumber === roomNumber) {
      safeSend(p.peer, encoded)
    }
  })
}

const sendToLobby = <T>(msg: WebsocketMessage<T>) => {
  const encoded = {
    ...msg,
    _scope: 'lobby'
  }

  players.forEach((p) => {
    if (p.state.type === 'lobby') {
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
