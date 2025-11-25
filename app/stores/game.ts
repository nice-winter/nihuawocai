import { useWsStore } from './ws'
import { usePlayerStore } from './player'
import type { WebsocketMessage } from '~~/shared/interfaces/ws'

// ----------------------------------------------------------------
//                          类型定义
// ----------------------------------------------------------------

export interface ItemCounts {
  flower: number
  egg: number
  slipper: number
}

export interface GiftRecord {
  from: string
  to: string
  itemType: 'flower' | 'egg' | 'slipper'
  count: number
  timestamp: number
}

// 结算数据结构
export interface SettlementData {
  scores: Record<string, number>
  itemCounts: Record<string, ItemCounts>
  giftHistory: GiftRecord[]
  seconds: number
}

export interface GameState {
  gamePhase: 'game_start' | 'game_round' | 'game_settlement' | 'game_end'
  roundPhase: 'round_prepare' | 'drawing' | 'interaction' | 'round_end'
  currentRound: number
  totalRounds: number
  drawer: string | null
  currentWord: string | null
  prompts: string[]
  bingoPlayers: string[]
  timeLeft: number
  scores: Record<string, number>
  itemCounts: Record<string, ItemCounts>
  settlementData: SettlementData | null

  draw: boolean
}

export const useGameStore = defineStore('game', () => {
  const { wsEventBus, send } = useWsStore()
  const { myId } = storeToRefs(usePlayerStore())
  const { currentRoom } = storeToRefs(useRoomStore())
  const { getPlayerFromCurrentRoom } = useRoomStore()

  const defaultState: GameState = {
    gamePhase: 'game_start',
    roundPhase: 'round_prepare',
    currentRound: 0,
    totalRounds: 0,
    drawer: null,
    currentWord: null,
    prompts: [],
    bingoPlayers: [],
    timeLeft: 0,
    scores: {},
    itemCounts: {},
    settlementData: null,

    draw: false
  }

  const state = reactive<GameState>({ ...defaultState })

  const isMyTurn = computed(() => state.drawer === myId.value)
  const isDrawing = computed(() => state.roundPhase === 'drawing' && isMyTurn.value)

  const resetState = () => {
    Object.assign(state, defaultState)
    state.itemCounts = {}
    state.scores = {}
  }

  const resetRoundState = () => {
    state.roundPhase = 'round_prepare'
    state.currentWord = null
    state.prompts = []
    state.bingoPlayers = []

    state.draw = false
  }

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type.startsWith('game:')) {
      handleGameEvents(msg)
    }
  })

  const handleGameEvents = (msg: WebsocketMessage<unknown>) => {
    switch (msg.type) {
      // ==============================
      //       核心生命周期事件
      // ==============================

      case 'game:event:start': {
        const { payload } = msg as WebsocketMessage<{
          payload: { total_rounds: number }
        }>

        state.gamePhase = 'game_start'
        state.totalRounds = payload.total_rounds
        state.scores = {}
        state.itemCounts = {}

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 跳转至 Playing
        break
      }

      case 'game:event:settlement': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            scores: Record<string, number>
            item_counts: Record<string, ItemCounts>
            gift_history: GiftRecord[]
            seconds: number
          }
        }>

        state.gamePhase = 'game_settlement'
        state.settlementData = {
          scores: payload.scores,
          itemCounts: payload.item_counts,
          giftHistory: payload.gift_history,
          seconds: payload.seconds
        }
        state.timeLeft = payload.seconds

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 打开 <SettlementModal />
        eventBus.emit('game:event:settlement', {
          ...payload
        })
        break
      }

      case 'game:event:end': {
        state.gamePhase = 'game_end'
        resetState()

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 跳回 Lobby
        break
      }

      case 'game:event:state': {
        // 全量状态同步
        const { payload } = msg as WebsocketMessage<{
          payload: {
            game_phase: GameState['gamePhase']
            round_phase: GameState['roundPhase']
            round_index: number
            total_rounds: number
            drawer: string | null
            remaining_seconds: number
            bingo_players: string[]
            scores: Record<string, number>
            item_counts: Record<string, ItemCounts>
          }
        }>

        state.gamePhase = payload.game_phase
        state.roundPhase = payload.round_phase
        state.currentRound = payload.round_index
        state.totalRounds = payload.total_rounds
        state.drawer = payload.drawer
        state.timeLeft = payload.remaining_seconds
        state.bingoPlayers = payload.bingo_players || []
        state.scores = payload.scores || {}
        state.itemCounts = payload.item_counts || {}
        break
      }

      case 'game:event:notice': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            message: string
          }
        }>
        // !!! ⚡ UI 广播点 ⚡ !!!
        // Toast.info(payload.message)
        break
      }

      // ==============================
      //       回合流程控制事件
      // ==============================

      case 'game:event:round:prepare': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            round_index: number
            drawer: string
            seconds: number
          }
        }>

        resetRoundState()
        state.gamePhase = 'game_round'
        state.roundPhase = 'round_prepare'
        state.currentRound = payload.round_index
        state.drawer = payload.drawer
        state.timeLeft = payload.seconds

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 显示 "第X轮开始" 过场动画
        eventBus.emit('game:event:round:prepare', {
          ...payload,
          drawerPlayer: getPlayerFromCurrentRoom(payload.drawer)!
        })
        break
      }

      case 'game:event:drawing:start': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            drawer: string
            seconds: number
          }
        }>

        state.roundPhase = 'drawing'
        state.timeLeft = payload.seconds

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 检查 isMyTurn，切换 Canvas 锁定/解锁状态
        if (isMyTurn.value) state.draw = true
        eventBus.emit('game:event:drawing:start', {
          ...payload,
          drawerPlayer: getPlayerFromCurrentRoom(payload.drawer)!
        })
        break
      }

      case 'game:event:interaction:start': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            answer?: string
            bingo_players: string[]
            seconds: number
            reason: 'give_up' | 'bingo_all' | 'timeout' | 'afk' | 'force' | 'leave'
          }
        }>

        state.roundPhase = 'interaction'
        state.timeLeft = payload.seconds
        if (payload.answer) {
          state.currentWord = payload.answer
        }

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 1. 弹窗显示答案
        // 2. 显示本轮猜对的人 payload.bingo_players
        state.draw = false
        eventBus.emit('game:event:interaction:start', {
          ...payload,
          drawerPlayer: getPlayerFromCurrentRoom(state.drawer!)!,
          bingoPlayers: payload.bingo_players
            .map((p) => getPlayerFromCurrentRoom(p))
            .filter((p) => typeof p !== 'undefined')
        })
        break
      }

      case 'game:event:round:end': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            round: number
            scores: Record<string, number>
          }
        }>

        state.roundPhase = 'round_end'
        state.scores = payload.scores
        break
      }

      // ==============================
      //       游戏流程互动事件
      // ==============================

      case 'game:event:word': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            word: string
            category: string
          }
        }>

        state.currentWord = payload.word
        break
      }

      case 'game:event:prompt': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            content: string
            index: number
          }
        }>

        state.prompts.push(payload.content)

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 顶部提示栏闪烁
        eventBus.emit('game:event:prompt', {
          ...payload
        })
        break
      }

      case 'game:event:guess:bingo': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            id: string
            score_delta: {
              drawerId: string
              drawerGain: number
              guesserId: string
              guesserGain: number
            }
            bingo_players: string[]
            scores: Record<string, number>
          }
        }>

        state.bingoPlayers = payload.bingo_players
        state.scores = payload.scores

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 1. 播放 bingo 音效
        // 2. 聊天栏插入系统消息
        eventBus.emit('game:event:guess:bingo', {
          ...payload,
          player: getPlayerFromCurrentRoom(payload.id)!
        })
        break
      }

      case 'game:event:timer:update': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            seconds: number
            reason: string
          }
        }>

        state.timeLeft = payload.seconds

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 提示 "时间缩短"
        eventBus.emit('game:event:timer:update', {
          ...payload
        })
        break
      }

      case 'game:event:gift': {
        const { payload } = msg as WebsocketMessage<{
          payload: {
            from: string
            to: string
            item_type: 'flower' | 'egg' | 'slipper'
            count: number
          }
        }>

        if (!state.itemCounts[payload.to]) {
          state.itemCounts[payload.to] = { flower: 0, egg: 0, slipper: 0 }
        } else {
          state.itemCounts[payload.to]![payload.item_type] += payload.count
        }

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 播放抛物线动画: from -> to
        eventBus.emit('game:event:gift', {
          ...payload,
          fromPlayer: getPlayerFromCurrentRoom(payload.from)!
        })
        break
      }
      default:
        return
    }
  }

  // actions
  const giveUp = async () => {
    return await send({
      type: 'game:drawing:give_up'
    })
  }

  const sendGift = async (itemType: 'flower' | 'egg' | 'slipper') => {
    return await send({
      type: 'game:interaction:gift',
      item_type: itemType,
      count: 1
    })
  }

  return {
    state,
    isMyTurn,
    isDrawing,
    resetState,
    resetRoundState,
    giveUp,
    sendGift
  }
})
