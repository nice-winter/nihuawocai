/**
 * 游戏相关共享类型
 * 前后端共用，避免重复定义
 */

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

export type ItemType = 'flower' | 'egg' | 'slipper'

export type InteractionReason = 'give_up' | 'bingo_all' | 'timeout' | 'afk' | 'force' | 'leave'

export interface ItemCounts {
  flower: number
  egg: number
  slipper: number
}

export interface GiftRecord {
  from: string // 送道具者 ID
  to: string // 接收者 ID
  itemType: ItemType
  count: number
  timestamp: number // 赠送时间
}

export interface ScoreDelta {
  drawerId: string
  drawerGain: number
  guesserId: string
  guesserGain: number
}
