import { shortHash } from '#shared/utils'
import { defu } from 'defu'
import type { UserData } from '#shared/interfaces/userData'

const userDataStorage = useStorage('user_data')

const createUserData = async (
  id: string,
  authProvider: UserData['auth_provider'],
  avatarUrl: string,
  nickname?: string
) => {
  if (!nickname || nickname.trim() === '') {
    nickname = `玩家${shortHash()}`
  }

  const userData: UserData = {
    id,
    auth_provider: authProvider,
    email: '',
    avatar_url: avatarUrl,
    nickname,
    gender: 0,
    stats: {
      score: 0,
      flower_count: 0,
      egg_count: 0,
      slipper_count: 0,
      total_games: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    created_at: Date.now(),
    last_login_at: 0
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

const getUserData = async (id: string) => {
  return (await userDataStorage.getItem(id)) as UserData
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

const updateUserLastLoginAt = async (id: string) => {
  return await updateUserData(id, {
    last_login_at: Date.now()
  })
}

export {
  createUserData,
  hasUserData,
  getUserData,
  updateUserData,
  setUserData,
  updateUserLastLoginAt
}
