import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('SessionPlugin')

/**
 * @TODO session kv storage
 */
export default defineNitroPlugin(() => {
  const sessionStorage = useStorage('session')

  sessionHooks.hook('fetch', async (session, event) => {
    // sessionStorage.get(session.id)
  })

  sessionHooks.hook('clear', async (session, event) => {
    //
  })

  logger.debug('Session 存储初始化完成')
})
