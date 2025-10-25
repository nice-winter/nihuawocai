import type { Player } from './player'

type Players = (Player | null)[]

interface RoomListItemProps {
  roomNumber?: number
  author?: string
  players?: Players
  onlookers?: Player[]
  seats?: boolean[]
  playing?: boolean
  locked?: boolean
}

export type { RoomListItemProps }
