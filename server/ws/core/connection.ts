import { getUserData } from '~~/server/services/user'
import type { WsPeer } from '~~/server/ws/utils'

export const resolveUserFromPeer = async (peer: WsPeer) => {
  try {
    const { user: sessionUser } = await getUserSession({ ...peer.request, context: peer.context })
    if (!sessionUser) return { session: null, userData: null }
    const userData = await getUserData(sessionUser.id)
    return { session: sessionUser, userData }
  } catch {
    return { session: null, userData: null }
  }
}
