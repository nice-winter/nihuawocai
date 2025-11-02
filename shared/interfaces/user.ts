export interface GitHubUser {
  // 基本信息
  id: number
  login: string
  avatar_url: string
  html_url: string
  type: string

  // 个人资料
  name: string
  email: string
  company?: string
  blog?: string
  location?: string
  bio?: string
  hireable?: boolean

  // 统计数据
  public_repos?: number
  public_gists?: number
  followers?: number
  following?: number

  // 时间信息
  created_at?: string
  updated_at?: string

  // 其他可选属性
  node_id?: string
  gravatar_id?: string
  url?: string
  followers_url?: string
  following_url?: string
  gists_url?: string
  starred_url?: string
  subscriptions_url?: string
  organizations_url?: string
  repos_url?: string
  events_url?: string
  received_events_url?: string
  site_admin?: boolean
  twitter_username?: string | null
  notification_email?: string
  user_view_type?: string
}

export interface SteamUser {
  // 基本身份信息
  steamid: string
  personaname: string
  profileurl: string

  // 头像信息
  avatar: string
  avatarmedium: string
  avatarfull: string
  avatarhash?: string

  // 状态信息
  personastate: number
  lastlogoff?: number
  timecreated?: number

  // 其他可选属性
  communityvisibilitystate?: number
  profilestate?: number
  primaryclanid?: string
  personastateflags?: number
}

export interface XUser {
  id: string
  username: string
  name: string
  profile_image_url: string
  description: string
  verified: boolean
  verified_type: string
}
