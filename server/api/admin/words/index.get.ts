import { useWordManager } from '~~/server/services/word'

/**
 * 词库列表接口（不含词汇内容，减少传输）
 */
export default defineEventHandler(async () => {
  const wordManager = useWordManager()

  // 获取所有词库 ID
  const libraryIds = await wordManager.getLibraryIndex()

  // 批量获取词库元数据
  const libraries = []
  for (const id of libraryIds) {
    const lib = await wordManager.getLibraryById(id)
    if (lib) {
      // 只返回元数据，不包含词汇内容
      libraries.push({
        id: lib.id,
        name: lib.name,
        description: lib.description,
        authorId: lib.authorId,
        editorIds: lib.editorIds,
        tags: lib.tags,
        wordCount: lib.words.length,
        createdAt: lib.createdAt,
        updatedAt: lib.updatedAt
      })
    }
  }

  // 按更新时间倒序排序
  libraries.sort((a, b) => b.updatedAt - a.updatedAt)

  return libraries
})
