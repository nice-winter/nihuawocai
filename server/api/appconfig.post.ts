import { defaultAppConfig } from '#shared/defaultAppConfig'
import type { AppConfig } from '#shared/interfaces/appConfig'
import defu from 'defu'

export default defineEventHandler(async (event) => {
  // @todo: 此处鉴权不仅需要登录，还需要验证其是否为管理员
  await requireUserSession(event)

  const appStorage = useStorage('app')

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
