import { shortHash } from '#shared/utils'
import type { UserData } from '#shared/interfaces/userData'
import { defu } from 'defu'

const userDataStorage = useAppStorage('user_data')

const createUserData = async (
  id: string,
  userType: UserData['user_type'],
  avatarUrl: string,
  nickname?: string
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
    },
    verification: {
      verified: false,
      verified_description: ''
    }
  }

  if (await userDataStorage.hasItem(id)) {
    return false
  } else {
    await userDataStorage.setItem(id, userData)
  }

  return true
}

const hasUserData = (id: string) => {
  return userDataStorage.hasItem(id)
}

const getUserData = (id: string) => {
  return userDataStorage.getItem(id)
}

const setUserData = (id: string, userData: UserData) => {
  return userDataStorage.setItem(id, userData)
}

const updateUserData = async (id: string, userData: Partial<UserData>) => {
  const _ = await getUserData(id)
  if (_) {
    userDataStorage.setItem(id, defu(userData, _))
  }
  return Boolean(_)
}

export { createUserData, hasUserData, getUserData, updateUserData, setUserData }
