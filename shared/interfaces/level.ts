export interface LevelInfo {
  level: number
  minScore: number
  title: string
}

export interface UserLevelInfo {
  level: number
  title: string
  currentScore: number
  nextLevelScore: number | null
  progress: number
  isMaxLevel: boolean
}
