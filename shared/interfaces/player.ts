interface Player {
  uuid: string
  avatar_url: string
  nickname: string
  gender: number
  exinfo: {
    score: number
    flowers: number
    count: number
  }
}

export type { Player }
