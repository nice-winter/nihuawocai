import { addAdmin, isSuperAdmin, getAdminList } from '~~/server/utils/admin'
import { hasUserData } from '~~/server/services/user'
import { consola } from 'consola'

const logger = consola.withTag('Admin Add')

/**
 * 添加管理员接口（仅超级管理员可操作）
 */
export default defineEventHandler(async (event) => {
  // 验证是否为超级管理员
  const userId = event.context.adminUserId
  const adminList = await getAdminList()
  const isSuper = await isSuperAdmin(userId)

  logger.info(`添加管理员请求: userId=${userId}, superAdminId=${adminList.superAdminId}, isSuper=${isSuper}`)

  if (!isSuper) {
    throw createError({
      statusCode: 403,
      statusMessage: '只有超级管理员才能添加管理员'
    })
  }

  const body = await readBody(event)
  const { userId: targetUserId } = body

  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: '请提供用户 ID'
    })
  }

  // 检查目标用户是否存在
  if (!(await hasUserData(targetUserId))) {
    throw createError({
      statusCode: 404,
      statusMessage: '目标用户不存在'
    })
  }

  // 添加管理员
  await addAdmin(targetUserId)

  return { message: '管理员添加成功' }
})
