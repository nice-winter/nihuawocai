import { useSQLite3Storage } from '../storage'
import { defaultAppConfig } from '#shared/defaultAppConfig'
import type { AppConfig } from '~~/shared/interfaces/appConfig'
import defu from 'defu'

export default defineEventHandler(async (event) => {
  const appStorage = import.meta.dev ? useStorage('app') : useSQLite3Storage('app')

  const appConfig = (await appStorage.get('app_config')) as AppConfig
  const _ = (await readBody(event)) as Partial<AppConfig>

  if (appConfig && _) {
    const newAppConfig = defu(_, appConfig)
    await appStorage.set('app_config', newAppConfig)
    return newAppConfig
  }

  createError({
    statusCode: 500
  })
})
