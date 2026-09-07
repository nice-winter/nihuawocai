import { colors } from 'consola/utils'
import { useWordManager } from '~~/server/services/word'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('AdminWord')

/**
 * 删除词库接口
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

  // 检查是否是默认词库
  if (libraryId === 'default-official') {
    throw createError({
      statusCode: 400,
      statusMessage: '不能删除默认词库'
    })
  }

  // 删除词库
  await wordManager.deleteLibrary(libraryId)

  logger.info(`词库删除: ${colors.cyan(existingLib.name)} (ID: ${libraryId})，管理员 ${colors.cyan(event.context.adminUserId)}`)
  return { message: '词库删除成功' }
})
