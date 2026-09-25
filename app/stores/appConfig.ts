import { defaultAppConfig } from '#shared/defaultAppConfig'
import { consola } from 'consola/browser'

const logger = consola.withTag('AppConfig')

export const useAppConfigStore = defineStore('appConfig', () => {
  const def = defaultAppConfig
  const appConfig = ref(def)

  const pull = async () => {
    const remoteAppConfig = await $fetch('/api/app-config')
    appConfig.value = remoteAppConfig

    logger.success('拉取远程配置成功', appConfig.value)
  }

  const reset = async () => {
    appConfig.value = def
  }

  const update = async (patch: Partial<AppConfig>) => {
    appConfig.value = defuReplaceArray(patch, unref(appConfig.value))
    const result = await $fetch('/api/app-config', {
      method: 'POST',
      body: patch
    })

    logger.success('✅', '更新远程配置成功', appConfig.value)
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
