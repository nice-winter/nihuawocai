import { getUserData, updateUserData } from '~~/server/services/user'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

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
