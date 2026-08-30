import { useStorage } from 'nitropack/runtime'
import type { UserData } from '~~/shared/types/userData'

/**
 * 用户列表接口（分页、搜索）
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 20
  const search = (query.search as string) || ''

  // 获取所有用户数据
  const userDataStorage = useStorage('user_data')
  const keys = await userDataStorage.getKeys()

  // 批量获取用户数据
  let users: UserData[] = []
  for (const key of keys) {
    const userData = await userDataStorage.getItem<UserData>(key)
    if (userData) {
      users.push(userData)
    }
  }

  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase()
    users = users.filter(
      (user) =>
        user.nickname.toLowerCase().includes(searchLower) ||
        user.id.includes(search) ||
        user.email?.toLowerCase().includes(searchLower)
    )
  }

  // 按创建时间倒序排序
  users.sort((a, b) => b.created_at - a.created_at)

  // 分页
  const total = users.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = users.slice(start, end)

  return {
    list,
    total,
    page,
    pageSize
  }
})
