/**
 * @file game.ts - 游戏主逻辑服务
 * @author Winter <doyouknowmeemail@gmail.com>
 * @description 负责游戏核心流程循环、状态管理和主要计分机制
 * @created 2025-11-22
 * @lastModified 2025-11-24
 *
 * @module Game
 */

import defu from 'defu'
import { getAppConfig } from './app-config'
import {
  checkPlayerIsInRoom,
  getPlayer,
  sendToPlayer,
  sendToRoom,
  updatePlayerStats
} from './player'
import { end, roomEventBus } from './room'
import type { AppConfig } from '~~/shared/interfaces/appConfig'
import type { Room } from '~~/shared/interfaces/room'
import { useWordManager, type WordItem } from './word'

// ----------------------------------------------------------------
//                          类型定义
// ----------------------------------------------------------------

export type GamePhase =
  | 'game_start' // 游戏初始化
  | 'game_round' // 游戏进行回合中
  | 'game_settlement' // 最终结算 (展示积分结算榜)
  | 'game_end' // 游戏完全结束 (清理资源)

export type RoundPhase =
  | 'round_prepare' // 准备/倒计时
  | 'drawing' // 绘画中
  | 'interaction' // 互动 (答案展示/送花)
  | 'round_end' // 回合结束

export interface ItemCounts {
  flower: number
  egg: number
  slipper: number
}

export interface GiftRecord {
  from: string // 送道具者 ID
  to: string // 接收者 ID
  itemType: 'flower' | 'egg' | 'slipper'
  count: number
  timestamp: number // 赠送时间
}

export interface GameState {
  config: AppConfig['game']['room']

  // --- 状态标识 ---
  gamePhase: GamePhase
  roundPhase: RoundPhase

  // --- 进度控制 ---
  currentRoundIndex: number
  totalRounds: number
  drawer: string | null
  drawerQueue: string[] // 当前在座玩家 ID 队列

  // --- 游戏数据 ---
  currentWord: WordItem | null
  guesses: Record<string, string>
  bingoPlayers: string[]

  // --- 统计数据 ---
  scores: Record<string, number> // 玩家 ID -> 积分 (包含已离场玩家)
  itemCounts: Record<string, ItemCounts> // 玩家 ID -> 收到道具总数 (包含已离场玩家)
  giftHistory: GiftRecord[] // 全局送道具记录
  roundGiftSenders: Set<string> // 本回合已送道具的玩家 ID 集合

  // --- 辅助状态 ---
  revealedPrompts: number
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

const GameStateRecord = new Map<number, GameState>()
const GameLoopHandles = new Map<number, number>()

const wordManager = useWordManager()

// ----------------------------------------------------------------
//                           事件监听
// ----------------------------------------------------------------

roomEventBus.on('room:event:game_start', async ({ roomNumber, room }) => {
  await gameStart(roomNumber, room)
})

roomEventBus.on('room:event:player_leave', ({ roomNumber, player }) => {
  handlePlayerLeave(roomNumber, player.id)
})

roomEventBus.on('room:event:onlooker_join', ({ roomNumber, player }) => {
  handleOnlookerJoin(roomNumber, player.id)
})

// ----------------------------------------------------------------
//                核心生命周期 (Start / Loop / End)
// ----------------------------------------------------------------

/**
 * 1. 游戏开始入口
 */
const gameStart = async (roomNumber: number, room: Room) => {
  if (GameStateRecord.has(roomNumber)) throw new Error('该房间已在游戏中')

  const players = room.players.filter((p) => p !== null)
  if (players.length < 2) throw new Error('玩家数不足 2 人无法开始游戏')

  const defaultConfig = (await getAppConfig()).game.room
  const config = defu(room.config, defaultConfig)

  const drawerQueue = players.map((p) => p.id)
  const totalRounds = drawerQueue.length * config.cycle.count

  const initialScores: Record<string, number> = {}
  const initialItems: Record<string, ItemCounts> = {}

  players.forEach((p) => {
    initialScores[p.id] = 0
    initialItems[p.id] = { flower: 0, egg: 0, slipper: 0 }
  })

  const state: GameState = {
    config,
    gamePhase: 'game_start',
    roundPhase: 'round_prepare',
    currentRoundIndex: 0,
    totalRounds,
    drawer: null,
    drawerQueue,
    currentWord: null,
    guesses: {},
    bingoPlayers: [],
    scores: initialScores,
    itemCounts: initialItems,
    giftHistory: [], // 初始化道具记录
    roundGiftSenders: new Set(), // 初始化每回合送道具集合
    revealedPrompts: 0,
    drawingStartAt: 0,
    lastDrawTime: 0,
    timers: { startTime: Date.now(), endTime: Date.now(), duration: 0 }
  }

  GameStateRecord.set(roomNumber, state)

  sendToRoom(
    {
      type: 'game:event:start',
      from: roomNumber,
      payload: {
        total_rounds: totalRounds
      }
    },
    roomNumber
  )

  // 启动第一回合
  await startRound(roomNumber)
}

/**
 * 2. 游戏主循环 Tick
 */
const startGameTick = (roomNumber: number) => {
  if (GameLoopHandles.has(roomNumber)) {
    clearInterval(GameLoopHandles.get(roomNumber)!)
  }

  const tick = () => {
    const st = GameStateRecord.get(roomNumber)
    if (!st) {
      clearInterval(GameLoopHandles.get(roomNumber)!)
      return
    }

    const now = Date.now()
    const remaining = st.timers.endTime - now

    // A. 阶段时间结束检测
    if (remaining <= 0) {
      handlePhaseTimeout(roomNumber, st)
      return
    }

    // B. 绘画阶段特殊检测 (提示词 & AFK)
    if (st.roundPhase === 'drawing') {
      handleDrawingTick(roomNumber, st, now)
    }
  }

  const handle = setInterval(tick, 1000) as unknown as number
  GameLoopHandles.set(roomNumber, handle)
}

/**
 * 3. 进入结算展示阶段
 */
const enterSettlementPhase = (roomNumber: number, st: GameState) => {
  st.gamePhase = 'game_settlement'
  const waitSeconds = st.config.cycle.time.cycleEndWaitTimeSecond
  setupTimer(st, waitSeconds)

  // --- 数据过滤逻辑 ---
  let finalScores = st.scores
  let finalItemCounts = st.itemCounts

  // 如果不允许包含离场玩家，则进行过滤
  if (!st.config.cycle.scoreRule.includeLeaversInSettlement) {
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
    updatePlayerStats(id, {
      total_games: 1,
      score: finalScores[id],
      flower_count: finalItemCounts[id].flower,
      egg_count: finalItemCounts[id].egg,
      slipper_count: finalItemCounts[id].slipper
    })
  })
  // ------------------

  sendToRoom(
    {
      type: 'game:event:settlement',
      from: roomNumber,
      payload: {
        scores: finalScores,
        item_counts: finalItemCounts,
        gift_history: st.giftHistory, // 包含道具记录
        seconds: waitSeconds
      }
    },
    roomNumber
  )
}

/**
 * 4. 游戏彻底结束
 */
const endGame = (roomNumber: number) => {
  const st = GameStateRecord.get(roomNumber)
  if (st) {
    st.gamePhase = 'game_end'
    st.roundPhase = 'round_end'
    sendToRoom({ type: 'game:event:end', from: roomNumber, payload: {} }, roomNumber)
  }
  cleanUpRoom(roomNumber)
  end(roomNumber)
}

// ----------------------------------------------------------------
//                       回合逻辑 (Round Flow)
// ----------------------------------------------------------------

/**
 * 开始新回合
 */
const startRound = async (roomNumber: number) => {
  const st = GameStateRecord.get(roomNumber)
  if (!st) return

  if (st.currentRoundIndex >= st.totalRounds) {
    enterSettlementPhase(roomNumber, st)
    return
  }

  // 重置小回合状态
  st.gamePhase = 'game_round'
  st.roundPhase = 'round_prepare'
  st.bingoPlayers = []
  st.guesses = {}
  st.revealedPrompts = 0
  st.roundGiftSenders.clear() // 重置送道具记录

  // 确定画手
  const drawerId = st.drawerQueue[st.currentRoundIndex % st.drawerQueue.length]
  st.drawer = drawerId

  // 如果算出来的画手不在了，直接开启新回合
  if (!drawerId) {
    st.currentRoundIndex++
    await startRound(roomNumber)
    return
  }

  st.currentWord = await wordManager.pickWord()
  const prepareSeconds = st.config.cycle.time.roundStartWaitTimeSecond
  setupTimer(st, prepareSeconds)

  sendToRoom(
    {
      type: 'game:event:round:prepare',
      from: roomNumber,
      payload: {
        round_index: st.currentRoundIndex + 1,
        drawer: st.drawer,
        seconds: prepareSeconds
      }
    },
    roomNumber
  )

  // 下发答案给画手
  if (st.drawer) {
    sendToPlayer(
      {
        type: 'game:event:word',
        payload: { word: st.currentWord!.word, category: '默认' }
      },
      st.drawer
    )
  }

  startGameTick(roomNumber)
}

/**
 * 阶段超时状态流转机
 */
const handlePhaseTimeout = (roomNumber: number, st: GameState) => {
  switch (st.gamePhase) {
    case 'game_settlement':
      endGame(roomNumber)
      break

    case 'game_round':
      switch (st.roundPhase) {
        case 'round_prepare':
          enterDrawingPhase(roomNumber, st)
          break
        case 'drawing':
          enterInteractionPhase(roomNumber, st, 'timeout')
          break
        case 'interaction':
          endCurrentRound(roomNumber, st)
          break
        case 'round_end':
          st.currentRoundIndex++
          startRound(roomNumber)
          break
      }
      break
  }
}

/**
 * 进入绘画阶段
 */
const enterDrawingPhase = (roomNumber: number, st: GameState) => {
  st.roundPhase = 'drawing'

  // 重置 AFK 时间戳
  st.drawingStartAt = Date.now()
  st.lastDrawTime = 0

  const drawingSeconds = st.config.cycle.time.roundDrawingTimeSecond
  setupTimer(st, drawingSeconds)

  sendToRoom(
    {
      type: 'game:event:drawing:start',
      from: roomNumber,
      payload: { drawer: st.drawer, seconds: drawingSeconds }
    },
    roomNumber
  )
}

/**
 * 绘画阶段的心跳检查 (提示词 + AFK)
 */
const handleDrawingTick = (roomNumber: number, st: GameState, now: number) => {
  const elapsedSeconds = Math.floor((now - st.timers.startTime) / 1000)

  // 1. AFK 检测
  const afkThresholdMs = st.config.cycle.time.roundDrawingTimeoutSecond * 1000
  if (st.lastDrawTime === 0 && now - st.drawingStartAt > afkThresholdMs) {
    sendToRoom(
      {
        type: 'game:event:notice',
        from: roomNumber,
        payload: { message: '长时间未作画，本回合结束' }
      },
      roomNumber
    )
    enterInteractionPhase(roomNumber, st, 'afk')
    return
  }

  // 2. 提示词逻辑
  const promptTimes = st.config.cycle.time.roundPromptTimeSecond
  if (st.revealedPrompts < promptTimes.length) {
    const nextPromptTime = promptTimes[st.revealedPrompts]
    if (elapsedSeconds >= nextPromptTime) {
      const promptIndex = st.revealedPrompts
      let promptContent = ''
      if (promptIndex === 0) {
        promptContent = `${st.currentWord!.word.length}个字`
      } else {
        const wordPromptIdx = promptIndex - 1
        promptContent = st.currentWord!.prompts[wordPromptIdx] || '没有提示了'
      }

      sendToRoom(
        {
          type: 'game:event:prompt',
          from: roomNumber,
          payload: { content: promptContent, index: promptIndex + 1 }
        },
        roomNumber
      )

      st.revealedPrompts++
    }
  }
}

/**
 * 进入互动/展示阶段
 */
const enterInteractionPhase = (
  roomNumber: number,
  st: GameState,
  reason: 'give_up' | 'bingo_all' | 'timeout' | 'afk' | 'force' | 'leave' = 'timeout'
) => {
  st.roundPhase = 'interaction'
  const waitSeconds = st.config.cycle.time.roundEndWaitTimeSecond
  setupTimer(st, waitSeconds)

  sendToRoom(
    {
      type: 'game:event:interaction:start',
      from: roomNumber,
      payload: {
        answer: st.currentWord?.word,
        bingo_players: st.bingoPlayers,
        seconds: waitSeconds,
        reason
      }
    },
    roomNumber
  )
}

/**
 * 结束本回合 (Round End)
 */
const endCurrentRound = (roomNumber: number, st: GameState) => {
  st.roundPhase = 'round_end'
  // calculateScore(st)

  // 极短过渡，由 Tick 处理跳转
  setupTimer(st, 0)

  sendToRoom(
    {
      type: 'game:event:round:end',
      from: roomNumber,
      payload: {
        round: st.currentRoundIndex + 1,
        scores: st.scores
      }
    },
    roomNumber
  )
}

// ----------------------------------------------------------------
//                       玩家交互方法 (Action)
// ----------------------------------------------------------------

/**
 * 画板交互处理
 */
const handleSketchpad = async (
  id: string,
  command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'clear',
  payload: unknown
) => {
  const player = getPlayer(id)
  if (!player || !checkPlayerIsInRoom(id)) throw new Error('你已离线或当前不在房间内')

  const roomNumber = player.state.roomNumber!
  const st = GameStateRecord.get(roomNumber)
  if (!st) throw new Error('找不到游戏')

  // 如果不是 drawing 阶段，忽略
  if (st.roundPhase !== 'drawing') throw new Error('当前不是绘画阶段')
  // 判断当前画手是否是调用者
  if (st.drawer !== id) throw new Error('当前不是你在画画')

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
    roomNumber,
    [id] // 广播消息时，排除自己
  )
}

/**
 * 画手主动放弃
 */
const handleGiveUp = (id: string) => {
  const player = getPlayer(id)
  if (!player || !checkPlayerIsInRoom(id)) throw new Error('你已离线或当前不在房间内')

  const roomNumber = player.state.roomNumber!
  const st = GameStateRecord.get(roomNumber)
  if (!st) throw new Error('找不到游戏')

  // 如果不是 drawing 阶段，忽略
  if (st.roundPhase !== 'drawing') throw new Error('当前不是绘画阶段')
  // 判断当前画手是否是调用者
  if (st.drawer !== id) throw new Error('当前不是你在画画')

  sendToRoom(
    {
      type: 'game:event:notice',
      from: roomNumber,
      payload: { message: '玩家放弃了本回合作画' }
    },
    roomNumber
  )
  // 更新一次活跃时间防止在状态切换瞬间被误判 AFK (虽然马上就切阶段了，保险起见)
  st.lastDrawTime = Date.now()

  enterInteractionPhase(roomNumber, st, 'give_up')
}

/**
 * 玩家猜词，通过 chat event 调用此函数
 * @param roomNumber
 * @param id
 * @param guessContent
 */
const handleGuess = (roomNumber: number, id: string, guessContent: string): boolean => {
  const st = GameStateRecord.get(roomNumber)
  if (!st || st.roundPhase !== 'drawing' || !st.currentWord) return false
  if (id === st.drawer) return false
  if (st.bingoPlayers.includes(id)) return false

  const normalizedGuess = guessContent.trim().toLowerCase()
  const normalizedAnswer = st.currentWord.word.trim().toLowerCase()

  if (normalizedGuess === normalizedAnswer) {
    st.bingoPlayers.push(id)

    const scoreDelta = applyScoreOnBingo(st, id)

    sendToRoom(
      {
        type: 'game:event:guess:bingo',
        from: roomNumber,
        payload: {
          id,
          score_delta: scoreDelta,
          bingo_players: st.bingoPlayers,
          scores: st.scores
        }
      },
      roomNumber
    )

    // 1. 首答，缩短绘画时间
    if (st.bingoPlayers.length === 1) {
      const now = Date.now()
      const remainingMs = st.timers.endTime - now
      const bingoTimeMs = st.config.cycle.time.roundBingoTimeSecond * 1000
      if (remainingMs > bingoTimeMs) {
        st.timers.endTime = now + bingoTimeMs
        sendToRoom(
          {
            type: 'game:event:timer:update',
            from: roomNumber,
            payload: {
              seconds: st.config.cycle.time.roundBingoTimeSecond,
              reason: 'bingo_shorten'
            }
          },
          roomNumber
        )
      }
    }

    // 2. 所有人猜对，直接转入互动阶段
    const activePlayersCount = st.drawerQueue.length
    if (st.bingoPlayers.length >= activePlayersCount - 1) {
      enterInteractionPhase(roomNumber, st, 'bingo_all')
    }

    return true
  }

  st.guesses[id] = guessContent
  return false
}

/**
 * 赠送道具
 */
const handleGift = (id: string, itemType: 'flower' | 'egg' | 'slipper') => {
  const player = getPlayer(id)
  if (!player || !checkPlayerIsInRoom(id)) throw new Error('你已离线或当前不在房间内')

  const roomNumber = player.state.roomNumber!
  const st = GameStateRecord.get(roomNumber)
  if (!st) throw new Error('找不到游戏')

  if (st.roundPhase !== 'interaction') throw new Error('非互动时间，无法赠送')
  if (st.drawer === id) throw new Error('不能给自己送道具')

  // --- 限制逻辑 ---
  if (st.roundGiftSenders.has(id)) {
    throw new Error('本回合你已经送过了')
  }

  const targetId = st.drawer
  if (!targetId) throw new Error('目标玩家不存在')

  // --- 记录数据 ---
  if (!st.itemCounts[targetId]) {
    st.itemCounts[targetId] = { flower: 0, egg: 0, slipper: 0 }
  }
  st.itemCounts[targetId][itemType]++

  st.roundGiftSenders.add(id) // 标记本回合已送

  // 记录流水
  st.giftHistory.push({
    from: id,
    to: targetId,
    itemType,
    count: 1,
    timestamp: Date.now()
  })

  sendToRoom(
    {
      type: 'game:event:gift',
      from: roomNumber,
      payload: {
        from: id,
        to: targetId,
        item_type: itemType,
        count: 1
      }
    },
    roomNumber
  )
}

// ----------------------------------------------------------------
//                       辅助工具 & 异常处理
// ----------------------------------------------------------------

/**
 * 旁观者加入处理
 * @param roomNumber
 * @param id
 */
const handleOnlookerJoin = (roomNumber: number, id: string) => {
  const st = GameStateRecord.get(roomNumber)
  if (!st) return
  const remainingMs = Math.max(0, st.timers.endTime - Date.now())

  sendToPlayer(
    {
      type: 'game:event:state',
      from: roomNumber,
      payload: {
        game_phase: st.gamePhase,
        round_phase: st.roundPhase,
        round_index: st.currentRoundIndex + 1,
        total_rounds: st.totalRounds,
        drawer: st.drawer,
        remaining_seconds: Math.ceil(remainingMs / 1000),
        bingo_players: st.bingoPlayers,
        scores: st.scores,
        item_counts: st.itemCounts
      }
    },
    id
  )
}

/**
 * 玩家离开处理
 * @param roomNumber
 * @param id
 */
const handlePlayerLeave = (roomNumber: number, id: string) => {
  const st = GameStateRecord.get(roomNumber)
  if (!st) return

  // 1. 移除队列
  const queueIndex = st.drawerQueue.indexOf(id)
  if (queueIndex !== -1) {
    st.drawerQueue.splice(queueIndex, 1)
  }

  // 2. 更新总轮数
  st.totalRounds = st.drawerQueue.length * st.config.cycle.count
  broadcastState(roomNumber)

  // 3. 检查剩余人数
  // 特殊情况：如果走得只剩 0 个人了（比如最后两个一起掉线），直接销毁，否则进入 Settlement 会因为没人而尴尬
  if (st.drawerQueue.length === 0) {
    cleanUpRoom(roomNumber)
    end(roomNumber)
    return
  }

  if (st.drawerQueue.length < 2) {
    sendToRoom(
      {
        type: 'game:event:notice',
        from: roomNumber,
        payload: { message: '剩余玩家不足 2 人，游戏即将结束' }
      },
      roomNumber
    )
    // 进入结算，让剩下的 1 个人看一眼记分板，然后等待超时调用 endGame
    enterSettlementPhase(roomNumber, st)
    return
  }

  // 4. 如果离开的是当前画手，直接快进
  if (st.drawer === id) {
    sendToRoom(
      {
        type: 'game:event:notice',
        from: roomNumber,
        payload: { message: '当前作画玩家离开，本回合跳过' }
      },
      roomNumber
    )
    enterInteractionPhase(roomNumber, st, 'leave')
  }
}

/**
 * 实时计算并应用分数 (在 handleGuess 中调用)
 * @returns 返回本次变动的分数，用于前端展示 "+10" 动画
 */
const applyScoreOnBingo = (st: GameState, guesserId: string) => {
  const rules = st.config.cycle.scoreRule
  const drawerId = st.drawer

  // 容错：如果没有画手信息，直接返回 0
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

const cleanUpRoom = (roomNumber: number) => {
  const handle = GameLoopHandles.get(roomNumber)
  if (handle) clearInterval(handle)
  GameLoopHandles.delete(roomNumber)
  GameStateRecord.delete(roomNumber)
}

const broadcastState = (roomNumber: number) => {
  const st = GameStateRecord.get(roomNumber)
  if (!st) return
  const remainingMs = Math.max(0, st.timers.endTime - Date.now())

  sendToRoom(
    {
      type: 'game:event:state',
      from: roomNumber,
      payload: {
        game_phase: st.gamePhase,
        round_phase: st.roundPhase,
        round_index: st.currentRoundIndex + 1,
        total_rounds: st.totalRounds,
        drawer: st.drawer,
        remaining_seconds: Math.ceil(remainingMs / 1000),
        bingo_players: st.bingoPlayers,
        scores: st.scores,
        item_counts: st.itemCounts
      }
    },
    roomNumber
  )
}

const forceEndRound = (roomNumber: number) => {
  const st = GameStateRecord.get(roomNumber)
  if (!st) return
  if (st.roundPhase === 'drawing' || st.roundPhase === 'round_prepare') {
    sendToRoom(
      {
        type: 'game:event:notice',
        from: roomNumber,
        payload: { message: '管理员强制结束了本回合' }
      },
      roomNumber
    )
    enterInteractionPhase(roomNumber, st, 'force')
  }
}

export {
  gameStart,
  handleSketchpad,
  handleGiveUp,
  handleGuess,
  handleGift,
  forceEndRound,
  GameStateRecord
}
