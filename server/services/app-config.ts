import { defaultAppConfig } from '#shared/defaultAppConfig'
import { createDefu } from 'defu'
import { initLogLevel } from '~~/server/utils/logger'

const appStorage = useStorage('app')
const keyName = 'app_config'

/**
 * 递归合并对象，数组字段直接替换而非拼接
 * 匹配原 updateAppConfig 的 `||` 语义：传了就用传的，没传就用默认
 */
const defuOverrideArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

const getAppConfig = async () => {
  const appConfig = await appStorage.get<AppConfig>(keyName)
  if (!appConfig) {
    return defaultAppConfig
  }
  initLogLevel(appConfig.admin.logLevel)
  return appConfig
}

const setAppConfig = async (appConfig: AppConfig) => {
  return await appStorage.set<AppConfig>(keyName, appConfig)
}

const updateAppConfig = async (appConfig: Partial<AppConfig>) => {
  const currentConfig = (await getAppConfig()) || defaultAppConfig
  const newAppConfig = defuOverrideArray(appConfig, currentConfig) as AppConfig

  await setAppConfig(newAppConfig)
  initLogLevel(newAppConfig.admin.logLevel)

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
