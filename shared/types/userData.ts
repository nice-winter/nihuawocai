/**
 * 用户数据
 */
export interface UserData {
  /** 关联的 id */
  id: string

  /** 用户登录方式 */
  auth_provider: 'github' | 'steam' | 'x' | 'qq'

  email: string
  avatar_url: string
  nickname: string

  /** 性别 */
  gender: number

  /** 统计数据 */
  stats: UserStats //

  /** 认证信息 */
  verification: UserVerification

  /** 创建时间 */
  created_at: number

  /** 上次登录时间 */
  last_login_at: number
}

/**
 * 用户统计数据
 */
export interface UserStats {
  /** 积分 */
  score: number

  /** 鲜花数量 */
  flower_count: number

  /** 鸡蛋数量 */
  egg_count: number

  /** 拖鞋数量 */
  slipper_count: number

  /** 总局数 */
  total_games: number
}

/**
 * 用户认证信息
 */
export interface UserVerification {
  verified: boolean

  /** 认证说明 */
  description: string
}
