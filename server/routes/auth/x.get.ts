import { colors } from 'consola/utils'
import { createUserData, hasUserData, updateUserData } from '~~/server/services/user'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('Auth')

export default defineOAuthXEventHandler({
  async onSuccess(event, { user, tokens }) {
    const xUser = user as XUser

    const avatar_url = xUser.profile_image_url.replace('_normal', '')

    await setUserSession(event, {
      user: {
        auth_provider: 'x',
        id: xUser.id,
        nickname: xUser.name,
        avatar_url
      },
      loggedInAt: Date.now()
    })

    if (await hasUserData(xUser.id)) {
      await updateUserData(xUser.id, {
        nickname: xUser.name,
        avatar_url
      })
    } else {
      await createUserData(xUser.id, 'x', avatar_url, xUser.name)
    }

    logger.info(`X(Twitter) 登录成功: ${colors.cyan(xUser.name)}@${xUser.id}`)
    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    logger.error('X(Twitter) OAuth 失败:', error)
  }
})
