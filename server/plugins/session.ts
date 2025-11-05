/**
 * @todo session kv storage
 */
export default defineNitroPlugin(() => {
  const sessionStorage = useAppStorage('session')

  sessionHooks.hook('fetch', async (session, event) => {
    // sessionStorage.get(session.id)
  })

  sessionHooks.hook('clear', async (session, event) => {
    //
  })
})
