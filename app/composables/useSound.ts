export const useSound = () => {
  const settingStore = useSettingStore()

  const baseUrl = `${window.location.origin}/_nuxt/assets/sounds`
  const audioMap = {
    clock: new Audio(`${baseUrl}/clock.mp3`),
    pop: new Audio(`${baseUrl}/pop.mp3`),
    giveUp: new Audio(`${baseUrl}/give-up.mp3`),
    end: new Audio(`${baseUrl}/end.mp3`)
  }

  const playSound = (name: keyof typeof audioMap) => {
    if (!settingStore.settings.sound) return

    const audio = audioMap[name]
    if (!audio) return
    audio.currentTime = 0
    audio.play()
  }

  return {
    playSound
  }
}
