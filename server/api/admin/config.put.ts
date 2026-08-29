import { updateAppConfig } from '~~/server/services/app-config'

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

  return updatedConfig
})
