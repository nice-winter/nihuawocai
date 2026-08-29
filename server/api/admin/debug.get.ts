import { getAdminList, isAdmin } from '~~/server/utils/admin'
import { getAppConfig } from '~~/server/services/app-config'

/**
 * 调试端点：检查管理员配置状态
 * 仅在开发环境可用
 */
export default defineEventHandler(async (event) => {
  // 只在开发环境可用
  if (process.env.NODE_ENV !== 'development') {
    throw createError({ statusCode: 404 })
  }

  const session = await requireUserSession(event)
  const userId = session.user.id

  const config = await getAppConfig()
  const adminList = await getAdminList()
  const isUserAdmin = await isAdmin(userId)

  return {
    userId,
    adminConfig: config.admin,
    adminList,
    isUserAdmin,
    superAdminMatch: config.admin.superAdminId === userId
  }
})
