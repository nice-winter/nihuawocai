import { getUserData, updateUserData } from '~~/server/services/user'
import type { UserData } from '~~/shared/types/userData'

/**
 * 编辑用户信息接口
 */
export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户 ID 不能为空'
    })
  }

  // 检查用户是否存在
  const existingUser = await getUserData(userId)
  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: '用户不存在'
    })
  }

  // 读取请求体
  const body = await readBody(event)

  // 过滤不允许修改的字段
  const allowedFields: (keyof UserData)[] = [
    'nickname',
    'avatar_url',
    'email',
    'gender',
    'verification'
  ]

  const updateData: Partial<UserData> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      ;(updateData as Record<string, unknown>)[field] = body[field]
    }
  }

  // 更新用户数据
  await updateUserData(userId, updateData)

  // 返回更新后的用户数据
  return await getUserData(userId)
})
