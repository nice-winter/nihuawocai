import { defaultAppConfig } from '#shared/defaultAppConfig'
import { defu } from 'defu'

const appStorage = useStorage('app')
const keyName = 'app_config'

/**
 * 确保配置包含所有必要的字段（使用 defu 合并默认值）
 * 注意：defu 对于数组会追加，所以只用于填充缺失的字段
 */
const ensureConfigFields = (config: AppConfig): AppConfig => {
  // 确保 admin 字段存在
  if (!config.admin) {
    config.admin = { ...defaultAppConfig.admin }
  }
  return config
}

const getAppConfig = async () => {
  const appConfig = await appStorage.get<AppConfig>(keyName)
  if (!appConfig) {
    return defaultAppConfig
  }
  // 确保必要的字段存在
  return ensureConfigFields(appConfig)
}

const setAppConfig = async (appConfig: AppConfig) => {
  return await appStorage.set<AppConfig>(keyName, appConfig)
}

const updateAppConfig = async (appConfig: Partial<AppConfig>) => {
  const currentConfig = (await getAppConfig()) || defaultAppConfig

  // 浅层合并，数组直接替换
  const newAppConfig: AppConfig = {
    ...currentConfig,
    ...appConfig,
    // 确保嵌套对象正确合并
    admin: appConfig.admin || currentConfig.admin,
    game: appConfig.game
      ? {
          ...currentConfig.game,
          ...appConfig.game,
          room: appConfig.game.room
            ? {
                ...currentConfig.game.room,
                ...appConfig.game.room,
                cycle: appConfig.game.room.cycle
                  ? {
                      ...currentConfig.game.room.cycle,
                      ...appConfig.game.room.cycle,
                      time: appConfig.game.room.cycle.time || currentConfig.game.room.cycle.time,
                      scoreRule:
                        appConfig.game.room.cycle.scoreRule ||
                        currentConfig.game.room.cycle.scoreRule
                    }
                  : currentConfig.game.room.cycle,
                time: appConfig.game.room.time || currentConfig.game.room.time,
                feature: appConfig.game.room.feature || currentConfig.game.room.feature,
                banners: appConfig.game.room.banners || currentConfig.game.room.banners
              }
            : currentConfig.game.room,
          lobby: appConfig.game.lobby || currentConfig.game.lobby,
          levels: appConfig.game.levels || currentConfig.game.levels
        }
      : currentConfig.game,
    announcements: appConfig.announcements || currentConfig.announcements,
    genders: appConfig.genders || currentConfig.genders,
    name: appConfig.name || currentConfig.name
  }

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
