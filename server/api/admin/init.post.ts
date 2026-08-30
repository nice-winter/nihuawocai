import {
  verifyInitSecret,
  clearInitSecret,
  setSuperAdmin
} from '~~/server/utils/admin'
import { hasUserData } from '~~/server/services/user'

/**
 * 管理员初始化接口
 * 此接口不需要管理员权限（因为是初始化用的）
 * 但需要用户已登录
 */
export default defineEventHandler(async (event) => {
  // 验证用户是否登录
  const session = await requireUserSession(event)
  const userId = session.user.id

  // 读取请求体
  const body = await readBody(event)
  const { secret } = body

  if (!secret) {
    throw createError({
      statusCode: 400,
      statusMessage: '请提供初始化 secret'
    })
  }

  // 验证 secret
  if (!verifyInitSecret(secret)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'secret 无效或已过期'
    })
  }

  // 检查用户数据是否存在
  if (!(await hasUserData(userId))) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户数据不存在，请先登录前台'
    })
  }

  // 设置超级管理员
  await setSuperAdmin(userId)

  // 清除 secret
  clearInitSecret()

  return {
    success: true,
    message: '超级管理员初始化成功'
  }
})
