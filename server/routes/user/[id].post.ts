import { colors } from 'consola/utils'
import { getUserData, updateUserData } from '~~/server/services/user'
import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('UserRoute')

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  const id = getRouterParam(event, 'id')
  const body = (await readBody(event)) as UserData

  if (id) {
    const userData = (await getUserData(id)) as UserData

    if (!userData) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    } else {
      userData.gender = body.gender
      await updateUserData(id, userData)
      logger.debug(`用户资料更新: ${colors.cyan(id)}，操作者 ${colors.cyan(session.user.id)}`)

      return {
        statusCode: 200
      }
    }
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID should be an integer'
    })
  }
})
