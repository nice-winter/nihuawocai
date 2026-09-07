import { colors } from 'consola/utils'
import { createUserData, hasUserData, updateUserData } from '~~/server/services/user'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('Auth')

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user, tokens }) {
    const githubUser = user as GitHubUser

    const id = githubUser.id.toString()

    await setUserSession(event, {
      user: {
        auth_provider: 'github',
        id,
        nickname: githubUser.name,
        avatar_url: githubUser.avatar_url
      },
      loggedInAt: Date.now()
    })

    if (await hasUserData(id)) {
      await updateUserData(id, {
        nickname: githubUser.name,
        avatar_url: githubUser.avatar_url
      })
    } else {
      await createUserData(id, 'github', githubUser.avatar_url, githubUser.name)
    }

    logger.info(`GitHub 登录成功: ${colors.cyan(githubUser.name)}@${id}`)
    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    logger.error('GitHub OAuth 失败:', error)
  }
})
