import { useWordManager } from '~~/server/services/word'

export default defineNitroPlugin(async () => {
  await useWordManager().initDefaultLibrary()
})
