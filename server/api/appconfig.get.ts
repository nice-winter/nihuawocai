import { defaultAppConfig } from '#shared/defaultAppConfig'
import type { AppConfig } from '#shared/interfaces/appConfig'

export default defineEventHandler(async (event) => {
  const appStorage = useStorage('app')

  const appConfig = (await appStorage.get('app_config')) as AppConfig

  if (appConfig) {
    return appConfig
  } else {
    await appStorage.set('app_config', defaultAppConfig)
  }
  return defaultAppConfig
})
