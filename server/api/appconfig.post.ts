import type { AppConfig } from '#shared/interfaces/appConfig'
import { updateAppConfig } from '~~/server/services/appconfig'

export default defineEventHandler(async (event) => {
  // @todo: 此处鉴权不仅需要登录，还需要验证其是否为管理员
  await requireUserSession(event)

  const appConfig = (await readBody(event)) as Partial<AppConfig>
  // @todo: 参数验证
  return await updateAppConfig(appConfig)
})
