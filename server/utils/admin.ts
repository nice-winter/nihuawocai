import { randomBytes } from 'node:crypto'
import { getAppConfig, updateAppConfig } from '~~/server/services/app-config'

// ----------------------------------------------------------------
//                          Secret 管理
// ----------------------------------------------------------------

/**
 * 内存中存储的初始化 secret
 * TODO: 预留过期机制，可添加 { secret: string, createdAt: number } 结构
 *       并在 getInitSecret() 中检查是否过期
 */
let initSecret: string | null = null

/**
 * 生成初始化 secret
 * @returns 生成的 secret 字符串
 */
export const generateInitSecret = (): string => {
  initSecret = randomBytes(16).toString('hex')
  return initSecret
}

/**
 * 获取当前 secret
 * @returns 当前 secret，如果不存在则返回 null
 */
export const getInitSecret = (): string | null => {
  return initSecret
}

/**
 * 清除 secret（初始化完成后调用）
 */
export const clearInitSecret = (): void => {
  initSecret = null
}

/**
 * 验证 secret 是否正确
 * @param secret 用户输入的 secret
 * @returns 是否匹配
 */
export const verifyInitSecret = (secret: string): boolean => {
  return initSecret !== null && initSecret === secret
}

// ----------------------------------------------------------------
//                          管理员判断
// ----------------------------------------------------------------

/**
 * 判断用户是否为管理员（包括超级管理员）
 * @param userId 用户 ID
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  const config = await getAppConfig()
  return config.admin.adminIds.includes(userId) || config.admin.superAdminId === userId
}

/**
 * 判断用户是否为超级管理员
 * @param userId 用户 ID
 */
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  const config = await getAppConfig()
  return config.admin.superAdminId === userId
}

// ----------------------------------------------------------------
//                          管理员管理
// ----------------------------------------------------------------

/**
 * 设置超级管理员（初始化时调用）
 * @param userId 用户 ID
 */
export const setSuperAdmin = async (userId: string): Promise<void> => {
  await updateAppConfig({
    admin: {
      superAdminId: userId,
      adminIds: []
    }
  })
}

/**
 * 添加管理员（仅超级管理员可操作）
 * @param userId 目标用户 ID
 */
export const addAdmin = async (userId: string): Promise<void> => {
  const config = await getAppConfig()

  // 检查是否已经是管理员
  if (config.admin.adminIds.includes(userId)) {
    throw new Error('该用户已经是管理员')
  }

  // 检查是否是超级管理员
  if (config.admin.superAdminId === userId) {
    throw new Error('超级管理员不能被添加为普通管理员')
  }

  await updateAppConfig({
    admin: {
      superAdminId: config.admin.superAdminId,
      adminIds: [...config.admin.adminIds, userId]
    }
  })
}

/**
 * 移除管理员（仅超级管理员可操作）
 * @param userId 目标用户 ID
 */
export const removeAdmin = async (userId: string): Promise<void> => {
  const config = await getAppConfig()

  // 检查是否是管理员
  if (!config.admin.adminIds.includes(userId)) {
    throw new Error('该用户不是管理员')
  }

  await updateAppConfig({
    admin: {
      superAdminId: config.admin.superAdminId,
      adminIds: config.admin.adminIds.filter((id) => id !== userId)
    }
  })
}

/**
 * 获取管理员列表
 */
export const getAdminList = async (): Promise<{
  superAdminId: string
  adminIds: string[]
}> => {
  const config = await getAppConfig()
  return {
    superAdminId: config.admin.superAdminId,
    adminIds: config.admin.adminIds
  }
}
