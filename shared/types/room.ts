import type { AppConfig } from './appConfig'
import type { Player } from './player'

interface RoomOptions {
  /** 房间密码 */
  password: string | ''
  /** 最大旁观人数 */
  maxOnlookers: number
  /** 词库合集 ID 列表 */
  libIds: string[]
}

type RoomConfig = AppConfig['game']['room']

type RoomPlayers = (Player | null)[]

/**
 * 房间信息（通常为非房间内玩家展示用，例如：大厅房间列表展示）
 * 有别于 Room，其内部的一些属性出于安全性可能会被替换或移除
 */
interface RoomInfo {
  id: string
  config: Partial<RoomConfig> | null
  options: RoomOptions

  roomNumber: number
  owner: string
  players: RoomPlayers
  onlookers: Player[]
  seats: boolean[]
  playing: boolean
  locked: boolean
}

/**
 * 完整的房间对象
 */
interface Room extends RoomInfo {
  id: string
  options: RoomOptions
  config: Partial<RoomConfig> | null
}

export type { RoomInfo, RoomOptions, RoomConfig, Room }
