import type { AppConfig } from './appConfig'
import type { Player } from './player'

type Players = (Player | null)[]

interface RoomInfo {
  roomNumber: number
  owner: string
  players: Players
  onlookers: Player[]
  seats: boolean[]
  playing: boolean
  locked: boolean
}

interface RoomOptions {
  password: string | ''
  maxOnlookers: number
}

type RoomConfig = AppConfig['game']['room']

interface Room extends RoomInfo {
  id: string
  options: RoomOptions
  config: RoomConfig | null
}

export type { RoomInfo, RoomOptions, RoomConfig, Room }
