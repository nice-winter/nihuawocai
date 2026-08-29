/**
 * 仪表盘统计数据（需要管理员权限）
 */
export default defineEventHandler(async (event) => {
  // 确保中间件已鉴权（中间件会设置这个字段）
  if (!event.context.adminUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: '权限不足'
    })
  }

  // 动态导入避免循环依赖
  const { players } = await import('~~/server/services/player')
  const { getRoomList } = await import('~~/server/services/room')
  const { useWordManager } = await import('~~/server/services/word')

  // 获取在线玩家数
  const onlinePlayers = players.size

  // 获取活跃房间数
  const rooms = getRoomList()
  const activeRooms = rooms.length

  // 获取总用户数
  const { useStorage } = await import('nitropack/runtime')
  const userDataStorage = useStorage('user_data')
  const userKeys = await userDataStorage.getKeys()
  const totalUsers = userKeys.length

  // 获取词库数量
  const wordManager = useWordManager()
  const wordLibraries = await wordManager.getLibraryIndex()
  const totalWordLibraries = wordLibraries.length

  // 服务器运行时间（秒）
  const serverUptime = Math.floor(process.uptime())

  return {
    onlinePlayers,
    activeRooms,
    totalUsers,
    totalWordLibraries,
    serverUptime
  }
})
