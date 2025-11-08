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
  password?: string
}

interface RoomOptions {
  password: string
  maxOnlookers: number
}

interface Room extends RoomInfo {
  options: RoomOptions
  config: AppConfig['game']['room'] | null
}

export type { RoomInfo, RoomOptions, Room }
