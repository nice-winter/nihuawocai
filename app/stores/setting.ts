import { useStorage } from '@vueuse/core'

export const useSettingStore = defineStore('setting', () => {
  const playerStore = usePlayerStore()
  const userId = computed(() => playerStore.loggedInPlayer?.id ?? 'guest')

  const settings = reactive({
    sound: true
  })

  const storageKey = computed(() => `settings:${userId.value}`)

  const loadFromStorage = () => {
    const stored = useStorage(storageKey.value, {
      sound: true
    })

    Object.assign(settings, stored.value)
  }

  watch(
    userId,
    () => {
      loadFromStorage()
    },
    { immediate: true }
  )

  watch(
    settings,
    (val) => {
      const stored = useStorage(storageKey.value, val)
      stored.value = val
    },
    { deep: true }
  )

  const switchSound = () => {
    settings.sound = !settings.sound
  }

  return {
    settings,
    switchSound
  }
})
