import { defineStore } from 'pinia'

export const useGameStore = defineStore('gameStore', () => {
  const isInRoom = ref<boolean>(false)
  const roomStage = ref<number>(0)

  return {
    isInRoom,
    roomStage
  }
})
