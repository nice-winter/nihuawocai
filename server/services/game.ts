/**
 * 游戏核心流程循环、状态管理和主要计分机制
 * @author Winter <littlewiinter@gmail.com>
 */

import defu from 'defu'
import { colors } from 'consola/utils'
import { getAppConfig } from './app-config'
import { createLogger } from '~~/server/utils/logger'
import {
  checkPlayerIsInRoom,
  getPlayer,
  sendToPlayer,
  sendToRoom,
  updatePlayerStats
} from './player'
import { end, roomEventBus } from './room'
import { useWordManager, type WordItem } from './word'
import { nanoid } from 'nanoid'

const logger = createLogger('GameService')

// ----------------------------------------------------------------
//                          类型定义 (从 shared/types/game 导入)
// ----------------------------------------------------------------

// GamePhase, TurnPhase, ItemCounts, ItemUse, InteractionReason, ItemType, ScoreChange
// 已统一定义在 shared/types/game.ts，通过 Nuxt 自动导入可用

export interface GameState {
  // 游戏场次唯一 ID
  id: string

  // --- 房间设置、配置 ---
  joinOptions: JoinOptions
  gameRules: RoomGameRules
  /** 房间号（仅用于日志展示，身份键是 roomId） */
  roomNumber: number

  // --- 状态标识 ---
  gamePhase: GamePhase
  turnPhase: TurnPhase

  // --- 进度控制 ---
  currentTurnIndex: number
  totalTurns: number
  drawerId: string | null
  drawerQueue: string[] // 当前在座玩家 ID 队列

  // --- 游戏数据 ---
  currentWord: WordItem | null
  guesses: Record<string, string>
  bingoPlayers: string[]

  // --- 统计数据 ---
  scores: Record<string, number> // 玩家 ID -> 积分 (包含已离场玩家)
  itemCounts: Record<string, ItemCounts> // 玩家 ID -> 收到道具总数 (包含已离场玩家)
  itemUses: ItemUse[] // 全局送道具记录
  turnItemSenders: Set<string> // 本回合已送道具的玩家 ID 集合

  // --- 辅助状态 ---
  revealedHints: number
  drawingStartAt: number // 本轮开始作画的时间戳
  lastDrawTime: number // 上次收到画笔数据的时间戳 (用于 AFK 检测)

  // --- 计时器 ---
  timers: {
    startTime: number
    endTime: number
    duration: number
  }
}

// ----------------------------------------------------------------
//                        内存存储 & Mock
// ----------------------------------------------------------------

const GameStateRecord = new Map<string, GameState>()
const GameLoopHandles = new Map<string, number>()

const wordManager = useWordManager()

// ----------------------------------------------------------------
//                           事件监听
// ----------------------------------------------------------------

roomEventBus.on('room:event:game_start', async ({ roomId, room }) => {
  await gameStart(roomId, room)
})

roomEventBus.on('room:event:player_leave', ({ roomId, player }) => {
  handlePlayerLeave(roomId, player.id)
})

roomEventBus.on('room:event:onlooker_join', ({ roomId, player }) => {
  handleOnlookerJoin(roomId, player.id)
})

// ----------------------------------------------------------------
//                核心生命周期 (Start / Loop / End)
// ----------------------------------------------------------------

/**
 * 1. 游戏开始入口
 */
const gameStart = async (roomId: string, room: Room) => {
  if (GameStateRecord.has(roomId)) throw new Error('该房间已在游戏中')

  const players = room.players.filter((p) => p !== null)
  if (players.length < 2) throw new Error('玩家数不足 2 人无法开始游戏')

  const joinOptions = room.joinOptions
  const defaultConfig = (await getAppConfig()).game.room
  const gameRules = defu(room.gameRules, defaultConfig)

  const drawerQueue = players.map((p) => p.id)
  const totalTurns = drawerQueue.length * gameRules.cycle.count

  const initialScores: Record<string, number> = {}
  const initialItems: Record<string, ItemCounts> = {}

  players.forEach((p) => {
    initialScores[p.id] = 0
    initialItems[p.id] = { flower: 0, egg: 0, slipper: 0 }
  })

  const state: GameState = {
    id: nanoid(),
    gameRules,
    joinOptions,
    roomNumber: room.roomNumber,
    gamePhase: 'game_start',
    turnPhase: 'turn_prepare',
    currentTurnIndex: 0,
    totalTurns,
    drawerId: null,
    drawerQueue,
    currentWord: null,
    guesses: {},
    bingoPlayers: [],
    scores: initialScores,
    itemCounts: initialItems,
    itemUses: [], // 初始化道具记录
    turnItemSenders: new Set(), // 初始化每回合送道具集合
    revealedHints: 0,
    drawingStartAt: 0,
    lastDrawTime: 0,
    timers: { startTime: Date.now(), endTime: Date.now(), duration: 0 }
  }

  GameStateRecord.set(roomId, state)

  logger.info(
    `游戏开始: 房间 ${colors.cyan('#' + room.roomNumber)}`,
    `${colors.cyan(String(players.length))} 名玩家，${totalTurns} 轮，游戏ID ${colors.gray(state.id)}`
  )

  sendToRoom(
    {
      type: 'game:event:start',
      payload: {
        totalTurns: totalTurns
      }
    },
    roomId
  )

  // 启动第一回合
  await startRound(roomId)
}

/**
 * 2. 游戏主循环 Tick
 */
const startGameTick = (roomId: string) => {
  if (GameLoopHandles.has(roomId)) {
    clearInterval(GameLoopHandles.get(roomId)!)
  }

  const tick = () => {
    const st = GameStateRecord.get(roomId)
    if (!st) {
      clearInterval(GameLoopHandles.get(roomId)!)
      return
    }

    const now = Date.now()
    const remaining = st.timers.endTime - now

    // A. 阶段时间结束检测
    if (remaining <= 0) {
      handlePhaseTimeout(roomId, st)
      return
    }

    // B. 绘画阶段特殊检测 (提示词 & AFK)
    if (st.turnPhase === 'drawing') {
      handleDrawingTick(roomId, st, now)
    }
  }

  const handle = setInterval(tick, 1000) as unknown as number
  GameLoopHandles.set(roomId, handle)
}

/**
 * 3. 进入结算展示阶段
 */
const enterSettlementPhase = (roomId: string, st: GameState) => {
  st.gamePhase = 'game_settlement'
  const waitSeconds = st.gameRules.cycle.time.settlementDisplaySeconds
  setupTimer(st, waitSeconds)

  // --- 数据过滤逻辑 ---
  let finalScores = st.scores
  let finalItemCounts = st.itemCounts

  // 如果不允许包含离场玩家，则进行过滤
  if (!st.gameRules.cycle.scoreRule.includeLeaversInSettlement) {
    const activePlayers = new Set(st.drawerQueue) // drawerQueue 始终代表当前在线玩家

    finalScores = Object.fromEntries(
      Object.entries(st.scores).filter(([uid]) => activePlayers.has(uid))
    )
    finalItemCounts = Object.fromEntries(
      Object.entries(st.itemCounts).filter(([uid]) => activePlayers.has(uid))
    )
  }
  // ------------------
  //   更新玩家统计信息
  const ids = Object.keys(finalScores)
  ids.forEach((id) => {
    const items = finalItemCounts[id]
    updatePlayerStats(id, {
      total_games: 1,
      score: finalScores[id],
      flower_count: items?.flower ?? 0,
      egg_count: items?.egg ?? 0,
      slipper_count: items?.slipper ?? 0
    })
  })
  // ------------------

  sendToRoom(
    {
      type: 'game:event:settlement',
      payload: {
        scores: finalScores,
        item_counts: finalItemCounts,
        itemUses: st.itemUses, // 包含道具记录
        displaySeconds: waitSeconds
      }
    },
    roomId
  )
}

/**
 * 4. 游戏彻底结束
 */
const endGame = (roomId: string) => {
  const st = GameStateRecord.get(roomId)
  if (st) {
    st.gamePhase = 'game_end'
    st.turnPhase = 'turn_end'
    logger.info(
      `游戏结束: 房间 ${colors.cyan('#' + st.roomNumber)}，游戏ID ${colors.gray(st.id)}`,
      `积分 ${JSON.stringify(st.scores)}`
    )
    sendToRoom({ type: 'game:event:end', payload: {} }, roomId)
  }
  cleanUpRoom(roomId)
  end(roomId)
}

// ----------------------------------------------------------------
//                       回合逻辑 (Round Flow)
// ----------------------------------------------------------------

/**
 * 开始新回合
 */
const startRound = async (roomId: string) => {
  const st = GameStateRecord.get(roomId)
  if (!st) return

  if (st.currentTurnIndex >= st.totalTurns) {
    enterSettlementPhase(roomId, st)
    return
  }

  // 重置小回合状态
  st.gamePhase = 'game_turn'
  st.turnPhase = 'turn_prepare'
  st.bingoPlayers = []
  st.guesses = {}
  st.revealedHints = 0
  st.turnItemSenders.clear() // 重置送道具记录

  // 确定画手
  const drawerId = st.drawerQueue[st.currentTurnIndex % st.drawerQueue.length] ?? null
  st.drawerId = drawerId

  // 如果算出来的画手不在了，直接开启新回合
  if (!drawerId) {
    st.currentTurnIndex++
    await startRound(roomId)
    return
  }

  st.currentWord = await wordManager.pickWord(st.joinOptions.wordLibIds)
  const prepareSeconds = st.gameRules.cycle.time.turnStartWaitTimeSecond
  setupTimer(st, prepareSeconds)

  logger.debug(
    `回合开始: 房间 ${colors.cyan('#' + st.roomNumber)}`,
    `第 ${st.currentTurnIndex + 1}/${st.totalTurns} 轮，画手 ${colors.cyan(drawerId!)}，题目 ${colors.green(st.currentWord?.word ?? '')}`
  )

  sendToRoom(
    {
      type: 'game:event:turn:prepare',
      payload: {
        turnIndex: st.currentTurnIndex + 1,
        drawerId: st.drawerId,
        durationSeconds: prepareSeconds
      }
    },
    roomId
  )

  // 下发答案给画手
  if (st.drawerId) {
    sendToPlayer(
      {
        type: 'game:event:word',
        payload: { word: st.currentWord!.word, category: '默认' }
      },
      st.drawerId
    )
  }

  startGameTick(roomId)
}

/**
 * 阶段超时状态流转机
 */
const handlePhaseTimeout = (roomId: string, st: GameState) => {
  switch (st.gamePhase) {
    case 'game_settlement':
      endGame(roomId)
      break

    case 'game_turn':
      switch (st.turnPhase) {
        case 'turn_prepare':
          enterDrawingPhase(roomId, st)
          break
        case 'drawing':
          enterInteractionPhase(roomId, st, 'timeout')
          break
        case 'interaction':
          endCurrentRound(roomId, st)
          break
        case 'turn_end':
          st.currentTurnIndex++
          startRound(roomId)
          break
      }
      break
  }
}

/**
 * 进入绘画阶段
 */
const enterDrawingPhase = (roomId: string, st: GameState) => {
  st.turnPhase = 'drawing'

  // 重置 AFK 时间戳
  st.drawingStartAt = Date.now()
  st.lastDrawTime = 0

  const drawingSeconds = st.gameRules.cycle.time.turnDrawingTimeSecond
  setupTimer(st, drawingSeconds)

  sendToRoom(
    {
      type: 'game:event:drawing:start',
      payload: { drawerId: st.drawerId, durationSeconds: drawingSeconds }
    },
    roomId
  )
}

/**
 * 绘画阶段的心跳检查 (提示词 + AFK)
 */
const handleDrawingTick = (roomId: string, st: GameState, now: number) => {
  const elapsedSeconds = Math.floor((now - st.timers.startTime) / 1000)

  // 1. AFK 检测
  const afkThresholdMs = st.gameRules.cycle.time.turnDrawingTimeoutSecond * 1000
  if (st.lastDrawTime === 0 && now - st.drawingStartAt > afkThresholdMs) {
    sendToRoom(
      {
        type: 'game:event:notice',
        payload: { message: '长时间未作画，本回合结束' }
      },
      roomId
    )
    enterInteractionPhase(roomId, st, 'afk')
    return
  }

  // 2. 提示词逻辑
  const hintTimes = st.gameRules.cycle.time.hintTimeOffsets
  if (st.revealedHints < hintTimes.length) {
    if (st.bingoPlayers.length > 0) return // 如果已有玩家猜对，则后续不再弹出提示词
    const nextHintTime = hintTimes[st.revealedHints]!
    if (elapsedSeconds >= nextHintTime) {
      const hintIndex = st.revealedHints
      const hintText =
        hintIndex === 0
          ? `${st.currentWord!.word.length}个字`
          : st.currentWord!.hints[hintIndex - 1] || '没有提示了'

      sendToRoom(
        {
          type: 'game:event:hint',
          payload: { hintText, hintIndex: hintIndex + 1 }
        },
        roomId
      )

      st.revealedHints++
    }
  }
}

/**
 * 进入互动/展示阶段
 */
const enterInteractionPhase = (
  roomId: string,
  st: GameState,
  reason: InteractionReason = 'timeout'
) => {
  st.turnPhase = 'interaction'
  const waitSeconds = st.gameRules.cycle.time.turnEndWaitTimeSecond
  setupTimer(st, waitSeconds)

  sendToRoom(
    {
      type: 'game:event:interaction:start',
      payload: {
        answer: st.currentWord?.word,
        bingoPlayerIds: st.bingoPlayers,
        durationSeconds: waitSeconds,
        reason
      }
    },
    roomId
  )
}

/**
 * 结束本回合 (Round End)
 */
const endCurrentRound = (roomId: string, st: GameState) => {
  st.turnPhase = 'turn_end'

  // 极短过渡，由 Tick 处理跳转
  setupTimer(st, 0)

  sendToRoom(
    {
      type: 'game:event:turn:end',
      payload: {
        turnIndex: st.currentTurnIndex + 1,
        scores: st.scores
      }
    },
    roomId
  )
}

// ----------------------------------------------------------------
//                       玩家交互方法 (Action)
// ----------------------------------------------------------------

/**
 * 画板交互处理
 */
const handleSketchpad = async (
  playerId: string,
  command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'undo' | 'redo' | 'clear',
  payload: unknown
) => {
  const player = getPlayer(playerId)
  if (!player || !checkPlayerIsInRoom(playerId)) throw new Error('你已离线或当前不在房间内')

  const roomId = player.state.roomId!
  const st = GameStateRecord.get(roomId)
  if (!st) throw new Error('找不到游戏')

  // 如果不是 drawing 阶段，忽略
  if (st.turnPhase !== 'drawing') throw new Error('当前不是绘画阶段')
  // 判断当前画手是否是调用者
  if (st.drawerId !== playerId) throw new Error('当前不是你在画画')

  switch (command) {
    // 切换笔触
    case 'pencil_switch':
      break
    // 更新笔触设置
    case 'pencil_options_update':
      break
    // 绘画
    case 'draw':
      // 更新上次作画时间，避免触发 afk
      st.lastDrawTime = Date.now()
      break
    // 撤销
    case 'undo':
      break
    // 重做
    case 'redo':
      break
    // 清空画板
    case 'clear':
      break
  }

  // 原样转发消息至房间内其他玩家
  // @TODO: 参数验证，防止乱填参数
  sendToRoom(
    {
      type: 'game:event:sketchpad',
      command,
      payload
    },
    roomId,
    [playerId] // 广播消息时，排除自己
  )
}

/**
 * 画手主动放弃
 */
const handleGiveUp = (playerId: string) => {
  const player = getPlayer(playerId)
  if (!player || !checkPlayerIsInRoom(playerId)) throw new Error('你已离线或当前不在房间内')

  const roomId = player.state.roomId!
  const st = GameStateRecord.get(roomId)
  if (!st) throw new Error('找不到游戏')

  // 如果不是 drawing 阶段，忽略
  if (st.turnPhase !== 'drawing') throw new Error('当前不是绘画阶段')
  // 判断当前画手是否是调用者
  if (st.drawerId !== playerId) throw new Error('当前不是你在画画')

  sendToRoom(
    {
      type: 'game:event:notice',
      payload: { message: '玩家放弃了本回合作画' }
    },
    roomId
  )
  // 更新一次活跃时间防止在状态切换瞬间被误判 AFK (虽然马上就切阶段了，保险起见)
  st.lastDrawTime = Date.now()

  enterInteractionPhase(roomId, st, 'give_up')
}

/**
 * 玩家猜词，通过 chat event 调用此函数
 * @param roomId 房间 ID
 * @param guesserId 猜词玩家 ID
 * @param guessContent 猜词内容
 */
const handleGuess = (roomId: string, guesserId: string, guessContent: string): boolean => {
  const st = GameStateRecord.get(roomId)
  if (!st || st.turnPhase !== 'drawing' || !st.currentWord) return false
  if (guesserId === st.drawerId) return false
  if (st.bingoPlayers.includes(guesserId)) return false

  const normalizedGuess = guessContent.trim().toLowerCase()
  const normalizedAnswer = st.currentWord.word.trim().toLowerCase()

  if (normalizedGuess === normalizedAnswer) {
    st.bingoPlayers.push(guesserId)
    logger.info(
      `猜对! 房间 ${colors.cyan('#' + st.roomNumber)}，玩家 ${colors.cyan(guesserId)}，第 ${st.bingoPlayers.length} 个猜对`
    )

    const scoreChange = applyScoreOnBingo(st, guesserId)

    sendToRoom(
      {
        type: 'game:event:guess:bingo',
        payload: {
          guesserId,
          scoreChange: scoreChange,
          bingoPlayerIds: st.bingoPlayers,
          scores: st.scores
        }
      },
      roomId
    )

    // 1. 首答，缩短绘画时间
    if (st.bingoPlayers.length === 1) {
      const now = Date.now()
      const remainingMs = st.timers.endTime - now
      const bingoTimeMs = st.gameRules.cycle.time.bingoShortenToSeconds * 1000
      if (remainingMs > bingoTimeMs) {
        st.timers.endTime = now + bingoTimeMs
        sendToRoom(
          {
            type: 'game:event:timer:update',
            payload: {
              remainingSeconds: st.gameRules.cycle.time.bingoShortenToSeconds,
              reason: 'bingo_shorten'
            }
          },
          roomId
        )
      }
    }

    // 2. 所有人猜对，直接转入互动阶段
    const activePlayersCount = st.drawerQueue.length
    if (st.bingoPlayers.length >= activePlayersCount - 1) {
      enterInteractionPhase(roomId, st, 'bingo_all')
    }

    return true
  }

  st.guesses[guesserId] = guessContent
  return false
}

/**
 * 赠送道具
 */
const handleItem = (playerId: string, itemType: ItemType) => {
  const player = getPlayer(playerId)
  if (!player || !checkPlayerIsInRoom(playerId)) throw new Error('你已离线或当前不在房间内')

  const roomId = player.state.roomId!
  const st = GameStateRecord.get(roomId)
  if (!st) throw new Error('找不到游戏')

  if (st.turnPhase !== 'interaction') throw new Error('非互动时间，无法赠送')
  if (st.drawerId === playerId) throw new Error('不能给自己送道具')

  // --- 限制逻辑 ---
  if (st.turnItemSenders.has(playerId)) {
    throw new Error('本回合你已经送过了')
  }

  const targetId = st.drawerId
  if (!targetId) throw new Error('目标玩家不存在')

  // --- 记录数据 ---
  if (!st.itemCounts[targetId]) {
    st.itemCounts[targetId] = { flower: 0, egg: 0, slipper: 0 }
  }
  st.itemCounts[targetId][itemType]++

  st.turnItemSenders.add(playerId) // 标记本回合已送

  // 记录流水
  st.itemUses.push({
    senderId: playerId,
    targetId,
    itemType,
    count: 1,
    timestamp: Date.now()
  })

  sendToRoom(
    {
      type: 'game:event:interaction:item',
      payload: {
        senderId: playerId,
        targetId,
        itemType,
        count: 1
      }
    },
    roomId
  )
}

// ----------------------------------------------------------------
//                       辅助工具 & 异常处理
// ----------------------------------------------------------------

/**
 * 旁观者加入处理
 * @param roomId 房间 ID
 * @param playerId 玩家 ID
 */
const handleOnlookerJoin = (roomId: string, playerId: string) => {
  const st = GameStateRecord.get(roomId)
  if (!st) return
  const remainingMs = Math.max(0, st.timers.endTime - Date.now())

  sendToPlayer(
    {
      type: 'game:event:state',
      payload: {
        game_phase: st.gamePhase,
        turnPhase: st.turnPhase,
        turnIndex: st.currentTurnIndex + 1,
        totalTurns: st.totalTurns,
        drawerId: st.drawerId,
        remaining_seconds: Math.ceil(remainingMs / 1000),
        bingoPlayerIds: st.bingoPlayers,
        scores: st.scores,
        item_counts: st.itemCounts
      }
    },
    playerId
  )
}

/**
 * 玩家离开处理
 * @param roomId 房间 ID
 * @param playerId 玩家 ID
 */
const handlePlayerLeave = (roomId: string, playerId: string) => {
  const st = GameStateRecord.get(roomId)
  if (!st) return

  // 1. 移除队列
  const queueIndex = st.drawerQueue.indexOf(playerId)
  if (queueIndex !== -1) {
    st.drawerQueue.splice(queueIndex, 1)
  }

  // 2. 更新总轮数
  st.totalTurns = st.drawerQueue.length * st.gameRules.cycle.count
  broadcastState(roomId)

  // 3. 检查剩余人数
  // 特殊情况：如果走得只剩 0 个人了（比如最后两个一起掉线），直接销毁，否则进入 Settlement 会因为没人而尴尬
  if (st.drawerQueue.length === 0) {
    logger.info(`游戏因全员离线结束: 房间 ${colors.cyan('#' + st.roomNumber)}`)
    cleanUpRoom(roomId)
    end(roomId)
    return
  }

  if (st.drawerQueue.length < 2) {
    sendToRoom(
      {
        type: 'game:event:notice',
        payload: { message: '剩余玩家不足 2 人，游戏即将结束' }
      },
      roomId
    )
    // 进入结算，让剩下的 1 个人看一眼记分板，然后等待超时调用 endGame
    enterSettlementPhase(roomId, st)
    return
  }

  // 4. 如果离开的是当前画手，直接快进
  if (st.drawerId === playerId) {
    sendToRoom(
      {
        type: 'game:event:notice',
        payload: { message: '当前作画玩家离开，本回合跳过' }
      },
      roomId
    )
    enterInteractionPhase(roomId, st, 'leave')
  }
}

/**
 * 实时计算并应用分数 (在 handleGuess 中调用)
 * @returns 返回本次变动的分数，用于前端展示 "+10" 动画
 */
const applyScoreOnBingo = (st: GameState, guesserId: string) => {
  const rules = st.gameRules.cycle.scoreRule
  const drawerId = st.drawerId

  // 容错：如果没有画手信息，直接返回 0
  // TODO: 此处返回缺 guesserId/drawerId，与 ScoreChange 类型不完全一致，后续补齐
  if (!drawerId) return { guesserGain: 0, drawerGain: 0 }

  // 判断是否是首杀 (First Blood)
  // 注意：调用此函数前，guesserId 已经被 push 进 bingoPlayers 了
  // 所以如果 length 为 1，说明他是第一个
  const isFirstBingo = st.bingoPlayers.length === 1

  // 1. 计算猜题者得分
  const guesserGain = isFirstBingo ? rules.player.firstBingo : rules.player.bingo

  // 2. 计算画手得分
  const drawerGain = isFirstBingo ? rules.drawingPlayer.firstBingo : rules.drawingPlayer.bingo

  // 3. 应用分数到总分池
  st.scores[guesserId] = (st.scores[guesserId] || 0) + guesserGain
  // 即便画手离线，分数也先记在账上，结算时再决定是否过滤
  st.scores[drawerId] = (st.scores[drawerId] || 0) + drawerGain

  return {
    guesserId,
    guesserGain,
    drawerId,
    drawerGain
  }
}

const setupTimer = (st: GameState, seconds: number) => {
  const now = Date.now()
  st.timers.startTime = now
  st.timers.duration = seconds
  st.timers.endTime = now + seconds * 1000
}

const cleanUpRoom = (roomId: string) => {
  const handle = GameLoopHandles.get(roomId)
  if (handle) clearInterval(handle)
  GameLoopHandles.delete(roomId)
  GameStateRecord.delete(roomId)
}

const broadcastState = (roomId: string) => {
  const st = GameStateRecord.get(roomId)
  if (!st) return
  const remainingMs = Math.max(0, st.timers.endTime - Date.now())

  sendToRoom(
    {
      type: 'game:event:state',
      payload: {
        game_phase: st.gamePhase,
        turnPhase: st.turnPhase,
        turnIndex: st.currentTurnIndex + 1,
        totalTurns: st.totalTurns,
        drawerId: st.drawerId,
        remaining_seconds: Math.ceil(remainingMs / 1000),
        bingoPlayerIds: st.bingoPlayers,
        scores: st.scores,
        item_counts: st.itemCounts
      }
    },
    roomId
  )
}

const forceEndTurn = (roomId: string) => {
  const st = GameStateRecord.get(roomId)
  if (!st) return
  if (st.turnPhase === 'drawing' || st.turnPhase === 'turn_prepare') {
    logger.info(`管理员强制结束回合: 房间 ${colors.cyan('#' + st.roomNumber)}`)
    sendToRoom(
      {
        type: 'game:event:notice',
        payload: { message: '管理员强制结束了本回合' }
      },
      roomId
    )
    enterInteractionPhase(roomId, st, 'force')
  }
}

/**
 * 聊天上下文查询 — 供 chat service 使用，不暴露内部 GameStateRecord
 */
interface ChatContext {
  /** 是否应当尝试猜词（drawing 阶段 + 非画手 + 未猜对） */
  shouldAttemptGuess: boolean
  /** 当前答案（仅已猜对玩家需要，用于脱敏；其余情况为 null） */
  answerForMasking: string | null
}

const getChatContext = (roomId: string, playerId: string): ChatContext | null => {
  const st = GameStateRecord.get(roomId)
  if (!st) return null

  const isDrawer = playerId === st.drawerId
  const hasBingoed = st.bingoPlayers.includes(playerId)

  const shouldAttemptGuess = st.turnPhase === 'drawing' && !isDrawer && !hasBingoed
  const answerForMasking = hasBingoed && st.currentWord ? st.currentWord.word : null

  return { shouldAttemptGuess, answerForMasking }
}

export {
  gameStart,
  handleSketchpad,
  handleGiveUp,
  handleGuess,
  handleItem,
  forceEndTurn,
  getChatContext,
  GameStateRecord
}
