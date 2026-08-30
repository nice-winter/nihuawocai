import { getAdminList } from '~~/server/utils/admin'

/**
 * 获取管理员列表接口
 */
export default defineEventHandler(async () => {
  return await getAdminList()
})
