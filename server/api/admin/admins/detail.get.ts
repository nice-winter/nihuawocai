import { getAdminList } from '~~/server/utils/admin'
import { getUserData } from '~~/server/services/user'

/**
 * 获取管理员列表（含用户详情）
 */
export default defineEventHandler(async () => {
  const { superAdminId, adminIds } = await getAdminList()

  // 获取超级管理员详情
  const superAdmin = superAdminId ? await getUserData(superAdminId) : null

  // 获取普通管理员详情
  const admins = []
  for (const id of adminIds) {
    const user = await getUserData(id)
    if (user) {
      admins.push(user)
    }
  }

  return {
    superAdmin: superAdmin
      ? { id: superAdmin.id, nickname: superAdmin.nickname, avatar_url: superAdmin.avatar_url, email: superAdmin.email }
      : null,
    admins: admins.map((u) => ({ id: u.id, nickname: u.nickname, avatar_url: u.avatar_url, email: u.email }))
  }
})
