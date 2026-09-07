import { colors } from 'consola/utils'
import { getUserData } from '~~/server/services/user'
import type { WsPeer } from '~~/server/ws/utils'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('Connection')

export const resolveUserFromPeer = async (peer: WsPeer) => {
  try {
    const { user: sessionUser } = await getUserSession({ ...peer.request, context: peer.context })
    if (!sessionUser) return { session: null, userData: null }
    const userData = await getUserData(sessionUser.id)
    return { session: sessionUser, userData }
  } catch (e) {
    logger.warn(`用户身份解析失败 peer=${colors.gray(peer.id)}:`, (e as Error).message)
    return { session: null, userData: null }
  }
}
