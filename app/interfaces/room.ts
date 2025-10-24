import type { Player } from './player'

interface RoomListItemProps {
  roomNumber?: number
  players?: Player[]
  onlookers?: Player[]
  playing?: boolean
  locked?: boolean
}

export type { RoomListItemProps }
