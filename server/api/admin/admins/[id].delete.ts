import { removeAdmin, isSuperAdmin } from '~~/server/utils/admin'

/**
 * 移除管理员接口（仅超级管理员可操作）
 */
export default defineEventHandler(async (event) => {
  // 验证是否为超级管理员
  const userId = event.context.adminUserId
  if (!(await isSuperAdmin(userId))) {
    throw createError({
      statusCode: 403,
      statusMessage: '只有超级管理员才能移除管理员'
    })
  }

  const targetUserId = getRouterParam(event, 'id')

  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户 ID 不能为空'
    })
  }

  // 检查是否尝试移除自己
  if (targetUserId === userId) {
    throw createError({
      statusCode: 400,
      statusMessage: '不能移除自己的管理员权限'
    })
  }

  // 移除管理员
  await removeAdmin(targetUserId)

  return { message: '管理员移除成功' }
})
