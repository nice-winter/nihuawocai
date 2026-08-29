/**
 * 管理员权限验证中间件
 * 检查用户是否已登录且具有管理员权限
 */
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession()

  // 检查是否已登录
  if (!loggedIn.value) {
    return navigateTo('/')
  }

  // 检查管理员权限
  try {
    await $fetch('/api/admin/auth-check')
  } catch (e: unknown) {
    const err = e as { data?: { statusCode?: number }; statusCode?: number; response?: { status?: number } }
    const statusCode = err.data?.statusCode || err.statusCode || err.response?.status

    // 超级管理员未初始化，跳转到初始化页面
    if (statusCode === 500) {
      return navigateTo('/admin/init')
    }
    // 非管理员，跳转到首页
    return navigateTo('/')
  }
})
