/**
 * 用户数据
 */
export interface UserData {
  /** 关联的 id */
  id: string

  /** 用户登录方式 */
  authProvider: 'github' | 'steam' | 'x' | 'qq'

  email: string
  avatarUrl: string
  nickname: string

  /** 性别 */
  gender: number

  /** 统计数据 */
  stats: UserStats //

  /** 认证信息 */
  verification: UserVerification

  /** 创建时间 */
  createdAt: number

  /** 上次登录时间 */
  lastLoginAt: number
}

/**
 * 用户统计数据
 */
export interface UserStats {
  /** 积分 */
  score: number

  /** 鲜花数量 */
  receivedFlowerCount: number

  /** 鸡蛋数量 */
  receivedEggCount: number

  /** 拖鞋数量 */
  receivedSlipperCount: number

  /** 总局数 */
  totalGames: number
}

/**
 * 用户认证信息
 */
export interface UserVerification {
  verified: boolean

  /** 认证说明 */
  note: string
}
