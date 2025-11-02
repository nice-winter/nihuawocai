import type { XUser } from '#shared/interfaces/user'

export default defineOAuthXEventHandler({
  async onSuccess(event, { user }) {
    const xUser = user as XUser

    await setUserSession(event, {
      user: {
        user_type: 'x',
        id: xUser.id,
        nickname: xUser.name,
        avatar_url: xUser.profile_image_url.replace('_normal', '')
      }
    })

    return sendRedirect(event, '/user/profile')
  },
  async onError(event, error) {}
})
