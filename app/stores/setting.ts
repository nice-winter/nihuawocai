export const useSettingStore = defineStore('setting', () => {
  const settings = reactive({
    sound: true
  })

  const switchSound = () => {
    settings.sound = !settings.sound
  }

  return {
    settings,
    switchSound
  }
})
