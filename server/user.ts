import { shortHash } from '#shared/utils/util'
import type { UserData } from '#shared/interfaces/userData'

const userDataStorage = useStorage('userData')

const createUserData = async (
  id: string,
  userType: UserData['user_type'],
  avatarUrl: string,
  nickname: string
) => {
  if (!nickname || nickname.trim() === '') {
    nickname = `玩家${shortHash()}`
  }

  const userData: UserData = {
    id,
    user_type: userType,
    email: '',
    avatar_url: avatarUrl,
    nickname,
    gender: 0,
    exinfo: {
      score: 0,
      flowers: 0,
      count: 0
    }
  }

  if (await userDataStorage.hasItem(id)) {
    return false
  }

  return await userDataStorage.setItem(id, userData)
}

const hasUserData = (id: string) => {
  return userDataStorage.hasItem(id)
}

const getUserData = (id: string) => {
  return userDataStorage.getItem(id)
}

const updateUserData = (id: string, userData: UserData) => {
  return userDataStorage.setItem(id, userData)
}

export { createUserData, hasUserData, getUserData, updateUserData }
