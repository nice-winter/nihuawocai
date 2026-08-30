import type { UserData } from '~~/shared/types/userData'

interface RankResponse {
  id: string
  nickname: string
  gender: number
  avatar_url: string
  score: number
  flower_count: number
  egg_count: number
  slipper_count: number
  total_games: number
}

export default defineEventHandler(async (event): Promise<RankResponse[]> => {
  const storage = useStorage('user_data')
  const query = getQuery(event)

  // 排序字段，默认按积分
  const sortBy = (query.sortBy as string) || 'score'
  // 返回数量，默认50
  const limit = Math.min(Number(query.limit) || 50, 100)

  // 获取所有用户数据
  const keys = await storage.getKeys()
  const users: UserData[] = []

  for (const key of keys) {
    const userData = await storage.getItem<UserData>(key)
    if (userData) {
      users.push(userData)
    }
  }

  // 排序函数
  const getSortValue = (user: UserData): number => {
    switch (sortBy) {
      case 'score':
        return user.stats.score
      case 'flower':
        return user.stats.flower_count
      case 'popularity':
        // 人气 = 鲜花 + 鸡蛋×2 + 拖鞋×3
        return user.stats.flower_count + user.stats.egg_count * 2 + user.stats.slipper_count * 3
      default:
        return user.stats.score
    }
  }

  // 排序并取前N名
  const ranked = users
    .sort((a, b) => getSortValue(b) - getSortValue(a))
    .slice(0, limit)
    .map((user) => ({
      id: user.id,
      nickname: user.nickname,
      gender: user.gender,
      avatar_url: user.avatar_url,
      score: user.stats.score,
      flower_count: user.stats.flower_count,
      egg_count: user.stats.egg_count,
      slipper_count: user.stats.slipper_count,
      total_games: user.stats.total_games,
    }))

  return ranked
})
