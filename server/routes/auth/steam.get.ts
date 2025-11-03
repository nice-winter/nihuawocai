import type { SteamUser } from '#shared/interfaces/user'
import { createUserData, hasUserData, updateUserData } from '~~/server/user'

export default defineOAuthSteamEventHandler({
  async onSuccess(event, { user }) {
    const steamUser = user as SteamUser

    await setUserSession(event, {
      user: {
        user_type: 'steam',
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

    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    //
  }
})
