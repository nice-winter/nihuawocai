import { Howl } from 'howler'
import { useSettingStore } from '@/stores/setting'

export const useSound = () => {
  const settingStore = useSettingStore()

  const baseUrl = `${window.location.origin}/_nuxt/assets/sounds`

  const soundMap = {
    clock: new Howl({
      src: [`${baseUrl}/clock.mp3`],
      preload: true,
      loop: true
    }),
    pop: new Howl({
      src: [`${baseUrl}/pop.mp3`],
      preload: true
    }),
    bingo: new Howl({
      src: [`${baseUrl}/bingo.mp3`],
      volume: 0.6,
      preload: true
    }),
    giveUp: new Howl({
      src: [`${baseUrl}/give-up.mp3`],
      preload: true
    }),
    end: new Howl({
      src: [`${baseUrl}/end.mp3`],
      preload: true
    })
  }

  // 播放
  const playSound = (name: keyof typeof soundMap) => {
    if (!settingStore.settings.sound) return
    const sound = soundMap[name]
    if (!sound) return
    sound.play()
  }

  // 停止某个音效
  const stopSound = (name: keyof typeof soundMap) => {
    const sound = soundMap[name]
    if (!sound) return
    sound.stop()
  }

  return {
    playSound,
    stopSound
  }
}
