import { useWordManager } from '~~/server/services/word'

/**
 * 获取单个词库详情接口（包含词汇内容）
 */
export default defineEventHandler(async (event) => {
  const libraryId = getRouterParam(event, 'id')

  if (!libraryId) {
    throw createError({
      statusCode: 400,
      statusMessage: '词库 ID 不能为空'
    })
  }

  const wordManager = useWordManager()

  // 获取词库数据
  const library = await wordManager.getLibraryById(libraryId)

  if (!library) {
    throw createError({
      statusCode: 404,
      statusMessage: '词库不存在'
    })
  }

  return library
})
