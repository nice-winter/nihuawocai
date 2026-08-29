import { useWordManager } from '~~/server/services/word'
import type { WordItem, WordLibrary } from '~~/server/services/word'

/**
 * 编辑词库接口
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

  // 检查词库是否存在
  const existingLib = await wordManager.getLibraryById(libraryId)
  if (!existingLib) {
    throw createError({
      statusCode: 404,
      statusMessage: '词库不存在'
    })
  }

  // 读取请求体
  const body = await readBody(event)

  // 更新元数据
  if (body.name !== undefined || body.description !== undefined) {
    await wordManager.updateLibraryMeta(libraryId, {
      name: body.name?.trim() || existingLib.name,
      description: body.description?.trim() || existingLib.description
    })
  }

  // 更新词汇
  if (body.words !== undefined) {
    if (!Array.isArray(body.words)) {
      throw createError({
        statusCode: 400,
        statusMessage: '词汇必须是数组格式'
      })
    }

    // 验证每个词汇的格式
    for (const word of body.words) {
      if (!word.word || !Array.isArray(word.prompts)) {
        throw createError({
          statusCode: 400,
          statusMessage: '词汇格式错误，需要 { word: string, prompts: string[] }'
        })
      }
    }

    await wordManager.setWords(libraryId, body.words as WordItem[])
  }

  // 返回更新后的词库
  return await wordManager.getLibraryById(libraryId)
})
