import { useWordManager } from '~~/server/services/word'
import type { WordItem } from '~~/server/services/word'

/**
 * 创建词库接口
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, description, words } = body

  // 验证必填字段
  if (!name || name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: '词库名称不能为空'
    })
  }

  // 验证词汇格式
  if (words && !Array.isArray(words)) {
    throw createError({
      statusCode: 400,
      statusMessage: '词汇必须是数组格式'
    })
  }

  // 验证每个词汇的格式
  if (words) {
    for (const word of words) {
      if (!word.word || !Array.isArray(word.prompts)) {
        throw createError({
          statusCode: 400,
          statusMessage: '词汇格式错误，需要 { word: string, prompts: string[] }'
        })
      }
    }
  }

  const wordManager = useWordManager()

  // 获取当前用户 ID（从中间件设置的 context 中获取）
  const userId = event.context.adminUserId

  // 创建词库
  const id = await wordManager.createLibrary(
    {
      name: name.trim(),
      description: description?.trim() || '',
      authorId: userId
    },
    (words as WordItem[]) || []
  )

  return { id, message: '词库创建成功' }
})
