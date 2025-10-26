import type { Player } from './player'

type Players = (Player | null)[]

interface RoomListItemProps {
  roomNumber?: number
  owner?: string
  players?: Players
  onlookers?: Player[]
  seats?: boolean[]
  playing?: boolean
  locked?: boolean
}

export type { RoomListItemProps }
