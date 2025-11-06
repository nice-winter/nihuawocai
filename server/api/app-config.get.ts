import { defaultAppConfig } from '#shared/defaultAppConfig'
import { getAppConfig, hasAppConfig } from '~~/server/services/app-config'

export default defineEventHandler(async (event) => {
  await hasAppConfig(true)
  return (await getAppConfig()) || defaultAppConfig
})
