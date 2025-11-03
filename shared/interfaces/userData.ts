export interface UserData {
  /** 关联的 id */
  id: string
  /** 用户登录类型 */
  user_type: 'github' | 'steam' | 'x' | 'qq'
  email: string
  avatar_url: string
  nickname: string
  gender: number
  exinfo: UserDataExinfo
  verification: UserDataVerification
}

export interface UserDataExinfo {
  score: number
  flowers: number
  count: number
}

export interface UserDataVerification {
  verified: boolean
  verified_description: string
}
