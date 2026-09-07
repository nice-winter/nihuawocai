import { colors } from 'consola/utils'
import { createUserData, hasUserData, updateUserData } from '~~/server/services/user'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('Auth')

export default defineOAuthSteamEventHandler({
  async onSuccess(event, { user }) {
    const steamUser = user as SteamUser

    await setUserSession(event, {
      user: {
        auth_provider: 'steam',
        id: steamUser.steamid,
        nickname: steamUser.personaname,
        avatar_url: steamUser.avatarfull
      },
      loggedInAt: Date.now()
    })

    if (await hasUserData(steamUser.steamid)) {
      await updateUserData(steamUser.steamid, {
        nickname: steamUser.personaname,
        avatar_url: steamUser.avatarfull
      })
    } else {
      await createUserData(steamUser.steamid, 'steam', steamUser.avatarfull, steamUser.personaname)
    }

    logger.info(`Steam 登录成功: ${colors.cyan(steamUser.personaname)}@${steamUser.steamid}`)
    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    logger.error('Steam OAuth 失败:', error)
  }
})
