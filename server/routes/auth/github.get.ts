import type { GitHubUser } from '#shared/interfaces/user'
import { createUserData, hasUserData, updateUserData } from '~~/server/services/user'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user, tokens }) {
    const githubUser = user as GitHubUser

    const id = githubUser.id.toString()

    await setUserSession(event, {
      user: {
        user_type: 'github',
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

    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    //
  }
})
