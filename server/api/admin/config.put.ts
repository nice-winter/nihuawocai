import { colors } from 'consola/utils'
import { updateAppConfig } from '~~/server/services/app-config'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('AdminConfig')

/**
 * 更新配置接口（支持部分更新）
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: '请求体格式错误'
    })
  }

  // 更新配置（使用 defu 合并，支持部分更新）
  const updatedConfig = await updateAppConfig(body)

  logger.info(
    `应用配置已更新，管理员 ${colors.cyan(event.context.adminUserId)}`,
    `字段 ${colors.yellow(Object.keys(body).join(', '))}`
  )
  return updatedConfig
})
