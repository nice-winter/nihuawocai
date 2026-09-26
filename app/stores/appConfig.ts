import { getDefaultAppConfig } from '#shared/defaultAppConfig'
import { consola } from 'consola/browser'

const logger = consola.withTag('AppConfig')

export const useAppConfigStore = defineStore('appConfig', () => {
  const appConfig = ref<AppConfig>(getDefaultAppConfig())

  const pull = async () => {
    const remoteAppConfig = await $fetch('/api/app-config')
    appConfig.value = remoteAppConfig

    logger.success('拉取远程配置成功', appConfig.value)
  }

  const reset = async () => {
    appConfig.value = getDefaultAppConfig()
  }

  const update = async (patch: Partial<AppConfig>) => {
    appConfig.value = defuReplaceArray(patch, unref(appConfig.value))
    await $fetch('/api/app-config', {
      method: 'POST',
      body: patch
    })

    logger.success('✅', '更新远程配置成功', appConfig.value)
  }

  const getAppConfig = () => appConfig.value

  /** 跟随配置更新：取用时请用 storeToRefs 或 store.levelHelper，直接解构会丢失响应性 */
  const levelHelper = computed(() => new LevelHelper(appConfig.value.game.levels))

  return {
    appConfig,
    getAppConfig,
    pull,
    reset,
    update,
    levelHelper
  }
})
