import { getUserData } from '~~/server/user'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (id) {
    const userData = getUserData(id)

    if (!userData) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    } else {
      return userData
    }
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID should be an integer'
    })
  }
})
