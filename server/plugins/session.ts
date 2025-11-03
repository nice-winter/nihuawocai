export default defineNitroPlugin(() => {
  const sessionStorage = useStorage('session')

  sessionHooks.hook('fetch', async (session, event) => {
    sessionStorage.get(session.id)

    console.log(`[session fetch]`, session)
  })

  sessionHooks.hook('clear', async (session, event) => {})
})
