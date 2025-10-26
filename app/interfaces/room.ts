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

export type { RoomInfo }
