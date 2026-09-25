import type { UserData } from '~~/shared/types/userData'

declare module '#auth-utils' {
  interface User {
    authProvider: UserData['authProvider']
    id: string
    nickname: string
    avatarUrl: string
  }

  interface UserSession {
    loggedInAt: number
  }

  interface SecureSessionData {
    [key: string]: unknown
  }
}

export {}
