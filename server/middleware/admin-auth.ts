import { isAdmin, isSuperAdmin, getAdminList } from '~~/server/utils/admin'

/**
 * 管理员权限验证中间件
 * 拦截所有 /api/admin/* 请求
 * 排除：auth-check（自行鉴权）、init（初始化用）
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // 只处理 /api/admin/* 路径
  if (!pathname.startsWith('/api/admin/')) {
    return
  }

  // auth-check 和 init 端点自行处理鉴权，跳过
  if (pathname.endsWith('/auth-check') || pathname.endsWith('/init')) {
    return
  }

  // 验证用户是否登录
  const session = await requireUserSession(event)
  const userId = session.user.id

  // 检查是否已设置超级管理员
  const { superAdminId } = await getAdminList()
  if (!superAdminId) {
    throw createError({
      statusCode: 500,
      statusMessage: '超级管理员未初始化'
    })
  }

  // 检查是否为管理员
  const adminCheck = await isAdmin(userId)
  if (!adminCheck) {
    throw createError({
      statusCode: 403,
      statusMessage: '权限不足，需要管理员权限'
    })
  }

  // 将用户信息存储到 event.context 供后续使用
  event.context.adminUserId = userId
  event.context.isSuperAdmin = await isSuperAdmin(userId)
})
