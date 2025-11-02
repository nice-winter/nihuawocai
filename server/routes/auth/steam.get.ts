import type { SteamUser } from '#shared/interfaces/user'

export default defineOAuthSteamEventHandler({
  async onSuccess(event, { user }) {
    const steamUser = user as SteamUser

    await setUserSession(event, {
      user: {
        user_type: 'steam',
        id: steamUser.steamid,
        nickname: steamUser.personaname,
        avatar_url: steamUser.avatarfull
      }
    })

    return sendRedirect(event, '/user/profile')
  },
  async onError(event, error) {}
})
