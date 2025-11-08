import type { UserData, UserDataExinfo, UserDataVerification } from '#shared/interfaces/userData'

type Player = UserData

interface PlayerState {
  id: string
  state: 'offline' | 'lobby' | 'in_room'
  roomNumber?: number
}

type LoggedInPlayer = Player & PlayerState

export type { Player, PlayerState, LoggedInPlayer }
