export default defineEventHandler(async (event) => {
  const result = await clearUserSession(event)
  return {
    success: result
  }
})
