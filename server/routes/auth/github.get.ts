import type { GitHubUser } from '#shared/interfaces/user'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    const githubUser = user as GitHubUser

    await setUserSession(event, {
      user: {
        user_type: 'github',
        id: githubUser.id.toString(),
        nickname: githubUser.name,
        avatar_url: githubUser.avatar_url
      }
    })

    return sendRedirect(event, '/')
  },
  async onError(event, error) {}
})
