import { defineStore } from 'pinia'

export const useGameStore = defineStore('gameStore', () => {
  const isInRoom = ref<boolean>(true)
  const roomStage = ref<number>(0)

  return {
    isInRoom,
    roomStage
  }
})
