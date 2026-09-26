import { getDefaultAppConfig } from '#shared/defaultAppConfig'
import { initLogLevel } from '~~/server/utils/logger'

const appStorage = useStorage('app')
const keyName = 'app_config'

const getAppConfig = async () => {
  const appConfig = await appStorage.get<AppConfig>(keyName)
  if (!appConfig) {
    return getDefaultAppConfig()
  }
  initLogLevel(appConfig.admin.logLevel)
  return appConfig
}

const setAppConfig = async (appConfig: AppConfig) => {
  return await appStorage.set<AppConfig>(keyName, appConfig)
}

const updateAppConfig = async (appConfig: Partial<AppConfig>) => {
  const currentConfig = (await getAppConfig()) || getDefaultAppConfig()
  const newAppConfig = defuReplaceArray(appConfig, currentConfig) as AppConfig

  await setAppConfig(newAppConfig)
  initLogLevel(newAppConfig.admin.logLevel)

  return newAppConfig
}

const resetAppConfig = async () => {
  return await setAppConfig(getDefaultAppConfig())
}

const hasAppConfig = async (init?: boolean) => {
  const has = await appStorage.has(keyName)
  if (!has && init) await resetAppConfig()
  return has
}

export { getAppConfig, setAppConfig, updateAppConfig, resetAppConfig, hasAppConfig }
