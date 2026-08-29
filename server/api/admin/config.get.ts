import { getAppConfig } from '~~/server/services/app-config'

/**
 * 获取完整配置接口
 */
export default defineEventHandler(async () => {
  return await getAppConfig()
})
