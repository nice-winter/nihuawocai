import type { XUser } from '#shared/interfaces/user'
import { createUserData, hasUserData, updateUserData } from '~~/server/services/user'

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

    return sendRedirect(event, '/')
  },
  async onError(event, error) {}
})
