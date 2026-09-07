import { useWordManager } from '~~/server/services/word'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('WordPlugin')

export default defineNitroPlugin(async () => {
  try {
    await useWordManager().initDefaultLibrary()
    logger.info('词库初始化完成')
  } catch (e) {
    logger.error('词库初始化失败:', e)
  }
})
