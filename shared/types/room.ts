import type { AppConfig } from './appConfig'
import type { Player } from './player'

interface JoinOptions {
  /** 房间密码 */
  password: string | ''
  /** 最大旁观人数 */
  maxOnlookers: number
  /** 词库合集 ID 列表 */
  wordLibIds: string[]
}

type RoomGameRules = AppConfig['game']['room']

type RoomPlayers = (Player | null)[]

/**
 * 房间信息（通常为非房间内玩家展示用，例如：大厅房间列表展示）
 * 有别于 Room，其内部的一些属性出于安全性可能会被替换或移除
 */
interface RoomSummary {
  id: string
  gameRules: Partial<RoomGameRules> | null
  joinOptions: JoinOptions

  roomNumber: number
  ownerId: string
  players: RoomPlayers
  onlookers: Player[]
  seatOpenFlags: boolean[]
  isPlaying: boolean
  hasPassword: boolean
}

/**
 * 完整的房间对象
 */
interface Room extends RoomSummary {
  id: string
  joinOptions: JoinOptions
  gameRules: Partial<RoomGameRules> | null
  createdById: string
  createdAt: number
}

export type { RoomSummary, JoinOptions, RoomGameRules, Room }
