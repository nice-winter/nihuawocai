import { colors } from 'consola/utils'
import { updateAppConfig } from '~~/server/services/app-config'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('AppConfig')

export default defineEventHandler(async (event) => {
  // @TODO: 此处鉴权不仅需要登录，还需要验证其是否为管理员
  const session = await requireUserSession(event)

  const appConfig = (await readBody(event)) as Partial<AppConfig>
  // @TODO: 参数验证
  logger.warn(
    `配置通过公开接口更新，用户 ${colors.cyan(session.user.id)}`,
    `字段 ${colors.yellow(Object.keys(appConfig).join(', '))}`
  )
  return await updateAppConfig(appConfig)
})
