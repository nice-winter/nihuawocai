import { useWordManager } from '~~/server/services/word'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('WordPlugin')

export default defineNitroPlugin(async () => {
  try {
    const wordManager = useWordManager()
    await wordManager.initDefaultLibrary()

    // 统计词库信息
    const libIndex = await wordManager.getLibraryIndex()
    const libStats: { name: string; count: number }[] = []
    for (const libId of libIndex) {
      const lib = await wordManager.getLibraryById(libId)
      if (lib) libStats.push({ name: lib.name, count: lib.words.length })
    }

    const totalWords = libStats.reduce((sum, lib) => sum + lib.count, 0)
    const tree = libStats
      .map(
        (lib, i) =>
          `${i === libStats.length - 1 ? '└── ' : '├── '}${lib.name} (${lib.count})`
      )
      .join('\n')
    logger.info(
      `✅ 词库就绪 · ${libIndex.length} 座词库 · ${totalWords} 个词条:\n${tree}`
    )
  } catch (e) {
    logger.error('词库初始化失败:', e)
  }
})
