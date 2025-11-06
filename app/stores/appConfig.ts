import { defaultAppConfig } from '#shared/defaultAppConfig'
import type { AppConfig } from '#shared/interfaces/appConfig'
import defu from 'defu'

export const useAppConfigStore = defineStore('appConfig', () => {
  const def = defaultAppConfig
  const appConfig = ref(def)

  const pull = async () => {
    const remoteAppConfig = await $fetch('/api/app-config')
    appConfig.value = remoteAppConfig

    console.log('[应用配置]', '拉取远程配置成功', appConfig.value)
  }

  const reset = async () => {
    appConfig.value = def
  }

  const update = async (_: Partial<AppConfig>) => {
    appConfig.value = defu(_, unref(appConfig.value))
    const result = await $fetch('/api/app-config', {
      method: 'POST',
      body: _
    })

    console.log('[应用配置]', '更新远程配置成功', appConfig.value)
  }

  const getAppConfig = () => appConfig.value

  const levelHelper = new LevelHelper(appConfig.value.game.levels)

  return {
    appConfig,
    getAppConfig,
    pull,
    reset,
    update,
    levelHelper
  }
})
