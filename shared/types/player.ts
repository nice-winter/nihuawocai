import type { UserData } from '~~/shared/types/userData'

type Player = UserData

interface PlayerState {
  id: string
  state: {
    type: 'offline' | 'lobby' | 'in_room'
    roomNumber: number | null
    onlooker: boolean
  }
}

type LoggedInPlayer = Player & PlayerState

export type { Player, PlayerState, LoggedInPlayer }
