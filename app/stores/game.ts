import { useWsStore } from './ws'
import { usePlayerStore } from './player'

// ----------------------------------------------------------------
//                          类型定义
// ----------------------------------------------------------------

// 结算数据结构
export interface SettlementData {
  scores: Record<string, number>
  itemCounts: Record<string, ItemCounts>
  itemUses: ItemUse[]
  displaySeconds: number
}

export interface GameState {
  gamePhase: GamePhase
  turnPhase: TurnPhase
  currentTurn: number
  totalTurns: number
  drawer: string | null
  currentWord: string | null
  hints: string[]
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
  const { getPlayerFromCurrentRoom } = useRoomStore()

  const defaultState: GameState = {
    gamePhase: 'game_start',
    turnPhase: 'turn_prepare',
    currentTurn: 0,
    totalTurns: 0,
    drawer: null,
    currentWord: null,
    hints: [],
    bingoPlayers: [],
    timeLeft: 0,
    scores: {},
    itemCounts: {},
    settlementData: null,

    draw: false
  }

  const state = reactive<GameState>({ ...defaultState })

  const isMyTurn = computed(() => state.drawer === myId.value)
  const isDrawing = computed(() => state.turnPhase === 'drawing' && isMyTurn.value)

  const resetState = () => {
    Object.assign(state, defaultState)
    state.itemCounts = {}
    state.scores = {}
  }

  const resetTurnState = () => {
    state.turnPhase = 'turn_prepare'
    state.currentWord = null
    state.hints = []
    state.bingoPlayers = []

    state.draw = false
  }

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type.startsWith('game:')) {
      handleGameEvents(msg as ServerEvent)
    }
  })

  const handleGameEvents = (msg: ServerEvent) => {
    switch (msg.type) {
      // ==============================
      //       核心生命周期事件
      // ==============================

      case 'game:event:start': {
        const { payload } = msg

        state.gamePhase = 'game_start'
        state.totalTurns = payload.totalTurns
        state.scores = {}
        state.itemCounts = {}

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 跳转至 Playing
        break
      }

      case 'game:event:settlement': {
        const { payload } = msg

        state.gamePhase = 'game_settlement'
        state.settlementData = {
          scores: payload.scores,
          itemCounts: payload.item_counts,
          itemUses: payload.itemUses,
          displaySeconds: payload.displaySeconds
        }
        state.timeLeft = payload.displaySeconds

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
        const { payload } = msg

        state.gamePhase = payload.game_phase
        state.turnPhase = payload.turnPhase
        state.currentTurn = payload.turnIndex
        state.totalTurns = payload.totalTurns
        state.drawer = payload.drawer
        state.timeLeft = payload.remaining_seconds
        state.bingoPlayers = payload.bingo_players || []
        state.scores = payload.scores || {}
        state.itemCounts = payload.item_counts || {}
        break
      }

      case 'game:event:notice': {
        // !!! ⚡ UI 广播点 ⚡ !!!
        // Toast.info(msg.payload.message)
        break
      }

      // ==============================
      //       回合流程控制事件
      // ==============================

      case 'game:event:turn:prepare': {
        const { payload } = msg

        resetTurnState()
        state.gamePhase = 'game_turn'
        state.turnPhase = 'turn_prepare'
        state.currentTurn = payload.turnIndex
        state.drawer = payload.drawer
        state.timeLeft = payload.durationSeconds

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 显示 "第X轮开始" 过场动画
        eventBus.emit('game:event:turn:prepare', {
          ...payload,
          drawerPlayer: getPlayerFromCurrentRoom(payload.drawer)!
        })
        break
      }

      case 'game:event:drawing:start': {
        const { payload } = msg

        state.turnPhase = 'drawing'
        state.timeLeft = payload.durationSeconds

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
        const { payload } = msg

        state.turnPhase = 'interaction'
        state.timeLeft = payload.durationSeconds
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

      case 'game:event:turn:end': {
        const { payload } = msg

        state.turnPhase = 'turn_end'
        state.scores = payload.scores
        break
      }

      // ==============================
      //       游戏流程互动事件
      // ==============================

      case 'game:event:word': {
        const { payload } = msg

        state.currentWord = payload.word
        break
      }

      case 'game:event:hint': {
        const { payload } = msg

        state.hints.push(payload.hintText)

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 顶部提示栏闪烁
        eventBus.emit('game:event:hint', {
          ...payload
        })
        break
      }

      case 'game:event:guess:bingo': {
        const { payload } = msg

        state.bingoPlayers = payload.bingo_players
        state.scores = payload.scores

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 1. 播放 bingo 音效
        // 2. 聊天栏插入系统消息
        eventBus.emit('game:event:guess:bingo', {
          ...payload,
          guesser: getPlayerFromCurrentRoom(payload.guesserId)!
        })
        break
      }

      case 'game:event:timer:update': {
        const { payload } = msg

        state.timeLeft = payload.remainingSeconds

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 提示 "时间缩短"
        eventBus.emit('game:event:timer:update', {
          ...payload
        })
        break
      }

      case 'game:event:interaction:item': {
        const { payload } = msg

        if (!state.itemCounts[payload.targetId]) {
          state.itemCounts[payload.targetId] = { flower: 0, egg: 0, slipper: 0 }
        } else {
          state.itemCounts[payload.targetId]![payload.itemType] += payload.count
        }

        // !!! ⚡ UI 广播点 ⚡ !!!
        // 播放抛物线动画: sender -> target
        eventBus.emit('game:event:interaction:item', {
          ...payload,
          sender: getPlayerFromCurrentRoom(payload.senderId)!,
          target: getPlayerFromCurrentRoom(payload.targetId)
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

  const sendItem = async (itemType: ItemType) => {
    return await send({
      type: 'game:interaction:item',
      itemType,
      count: 1
    })
  }

  return {
    state,
    isMyTurn,
    isDrawing,
    resetState,
    resetTurnState,
    giveUp,
    sendItem
  }
})
