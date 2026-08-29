import { isAdmin, getAdminList } from '~~/server/utils/admin'
import { consola } from 'consola'

const logger = consola.withTag('Admin Auth')

/**
 * 管理员权限检查（不需要经过 admin 中间件）
 * 用于前端中间件判断权限状态
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  // 检查是否已设置超级管理员
  const { superAdminId } = await getAdminList()

  if (!superAdminId) {
    logger.warn('超级管理员未初始化')
    throw createError({
      statusCode: 500,
      statusMessage: '超级管理员未初始化'
    })
  }

  // 检查是否为管理员
  const adminCheck = await isAdmin(userId)

  if (!adminCheck) {
    logger.warn(`用户 ${userId} 非管理员，超级管理员ID: ${superAdminId}`)
    throw createError({
      statusCode: 403,
      statusMessage: '权限不足，需要管理员权限'
    })
  }

  logger.info(`用户 ${userId} 鉴权通过`)
  return { ok: true }
})
