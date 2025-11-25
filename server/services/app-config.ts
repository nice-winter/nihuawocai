import { defaultAppConfig } from '#shared/defaultAppConfig'
import { defu } from 'defu'

const appStorage = useStorage('app')
const keyName = 'app_config'

const getAppConfig = async () => {
  const appConfig = await appStorage.get<AppConfig>(keyName)
  return appConfig || defaultAppConfig
}

const setAppConfig = async (appConfig: AppConfig) => {
  return await appStorage.set<AppConfig>(keyName, appConfig)
}

const updateAppConfig = async (appConfig: Partial<AppConfig>) => {
  const _ = (await getAppConfig()) || defaultAppConfig
  const newAppConfig = defu(appConfig, _)
  await setAppConfig(newAppConfig)
  return newAppConfig
}

const resetAppConfig = async () => {
  return await setAppConfig(defaultAppConfig)
}

const hasAppConfig = async (init?: boolean) => {
  const has = await appStorage.has(keyName)
  if (!has && init) await resetAppConfig()
  return has
}

export { getAppConfig, setAppConfig, updateAppConfig, resetAppConfig, hasAppConfig }
