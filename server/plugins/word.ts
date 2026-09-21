import { useWordManager } from '~~/server/services/word'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('WordPlugin')

export default defineNitroPlugin(async () => {
  try {
    const wordManager = useWordManager()
    await wordManager.initDefaultLibrary()

    // 统计词库信息
    const libIndex = await wordManager.getLibraryIndex()
    let totalWords = 0
    for (const libId of libIndex) {
      const lib = await wordManager.getLibraryById(libId)
      if (lib) totalWords += lib.words.length
    }

    logger.info(`✅ 词库就绪 · ${libIndex.length} 座词库 · ${totalWords} 个词条`)
  } catch (e) {
    logger.error('词库初始化失败:', e)
  }
})
