/**
 * 用户数据持久化与第三方登录资料同步
 * @author Winter <littlewiinter@gmail.com>
 */

import { shortHash } from '#shared/utils'
import { defu } from 'defu'
import { colors } from 'consola/utils'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('UserService')

const userDataStorage = useStorage('user_data')

const createUserData = async (
  userId: string,
  authProvider: UserData['authProvider'],
  avatarUrl: string,
  nickname?: string
) => {
  if (!nickname || nickname.trim() === '') {
    nickname = `玩家${shortHash()}`
  }

  const userData: UserData = {
    id: userId,
    authProvider: authProvider,
    email: '',
    avatarUrl: avatarUrl,
    nickname,
    gender: 0,
    stats: {
      score: 0,
      receivedFlowerCount: 0,
      receivedEggCount: 0,
      receivedSlipperCount: 0,
      totalGames: 0
    },
    verification: {
      verified: false,
      note: ''
    },
    createdAt: Date.now(),
    lastLoginAt: 0
  }

  if (await userDataStorage.hasItem(userId)) {
    logger.warn(`用户创建跳过，已存在: ${colors.cyan(userId)}`)
    return false
  } else {
    await userDataStorage.setItem(userId, userData)
    logger.info(`新用户创建: ${colors.cyan(nickname)}@${userId} (${colors.gray(authProvider)})`)
  }

  return true
}

const hasUserData = (userId: string) => {
  return userDataStorage.hasItem(userId)
}

const getUserData = async (userId: string) => {
  return (await userDataStorage.getItem(userId)) as UserData
}

const setUserData = (userId: string, userData: UserData) => {
  return userDataStorage.setItem(userId, userData)
}

const updateUserData = async (userId: string, patch: Partial<UserData>) => {
  const existing = await getUserData(userId)
  if (existing) {
    userDataStorage.setItem(userId, defu(patch, existing))
  }
  return Boolean(existing)
}

const updateUserLastLoginAt = async (userId: string) => {
  return await updateUserData(userId, {
    lastLoginAt: Date.now()
  })
}

/**
 * 更新玩家统计数据
 * @TODO 写在这里的原因是，考虑将来统计数据并不存在 UserData Service 中，而是独立出一个 UserStats Service
 * @param playerId 玩家 ID
 * @param stats 统计增量
 */
const updatePlayerStats = async (playerId: string, stats: Partial<UserStats>) => {
  const userData = await getUserData(playerId)
  const oldStats = userData.stats
  const newStats = defuSum(stats, oldStats)
  await updateUserData(playerId, { stats: newStats })
}

export {
  createUserData,
  hasUserData,
  getUserData,
  updateUserData,
  setUserData,
  updateUserLastLoginAt,
  updatePlayerStats
}
