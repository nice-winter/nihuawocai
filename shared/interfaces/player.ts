import type { UserDataExinfo, UserDataVerification } from '#shared/interfaces/userData'

interface Player {
  id: string
  avatar_url: string
  nickname: string
  gender: number
  exinfo: UserDataExinfo
  verification: UserDataVerification
}

export type { Player }
