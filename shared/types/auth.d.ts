import type { UserData } from '#shared/interfaces/userData'

declare module '#auth-utils' {
  interface User {
    auth_provider: UserData['auth_provider']
    id: string
    nickname: string
    avatar_url: string
  }

  interface UserSession {
    loggedInAt: number
  }

  interface SecureSessionData {
    [key: string]: unknown
  }
}

export {}
