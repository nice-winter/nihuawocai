import { colors } from 'consola/utils'
import { createUserData, hasUserData, updateUserData } from '~~/server/services/user'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('Auth')

export default defineOAuthXEventHandler({
  config: {
    scope: ['users.read', 'users.email']
  },
  async onSuccess(event, { user, tokens }) {
    const xUser = user as XUser

    const avatarUrl = xUser.profile_image_url.replace('_normal', '')

    await setUserSession(event, {
      user: {
        authProvider: 'x',
        id: xUser.id,
        nickname: xUser.name,
        avatarUrl
      },
      loggedInAt: Date.now()
    })

    if (await hasUserData(xUser.id)) {
      await updateUserData(xUser.id, {
        nickname: xUser.name,
        avatarUrl
      })
    } else {
      await createUserData(xUser.id, 'x', avatarUrl, xUser.name)
    }

    logger.info(`X(Twitter) 登录成功: ${colors.cyan(xUser.name)}@${xUser.id}`)
    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    logger.error('X(Twitter) OAuth 失败:', error)
  }
})
