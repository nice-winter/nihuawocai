import { consola } from 'consola'
import { getAppConfig } from '~~/server/services/app-config'
import { generateInitSecret } from '~~/server/utils/admin'

export default defineNitroPlugin(async () => {
  const logger = consola.withTag('Admin Init')

  try {
    const appConfig = await getAppConfig()

    // 检查配置是否存在
    if (!appConfig) {
      logger.warn('无法获取应用配置，跳过管理员初始化检查')
      return
    }

    // 检查是否已设置超级管理员
    if (!appConfig.admin?.superAdminId) {
      const secret = generateInitSecret()

      // 使用 consola.box 输出 secret（如果可用），否则使用普通输出
      logger.log('')
      logger.log('┌─────────────────────────────────────────────────────┐')
      logger.log('│  🔐 Admin Init Secret                               │')
      logger.log(`│  ${secret}  │`)
      logger.log('│  访问 /admin 进行超级管理员初始化                  │')
      logger.log('└─────────────────────────────────────────────────────┘')
      logger.log('')

      // TODO: 预留 secret 过期机制
      // 可以在这里设置定时器，在一定时间后自动清除 secret
      // setTimeout(() => { clearInitSecret() }, EXPIRE_TIME)
    } else {
      logger.info('超级管理员已设置，跳过初始化')
    }
  } catch (error) {
    logger.error('管理员初始化检查失败:', error)
  }
})
