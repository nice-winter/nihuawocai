export interface LevelInfo {
  level: number
  minScore: number
  title: string
}

export interface UserLevelInfo {
  level: number
  title: string
  currentScore: number
  nextLevelMinScore: number | null
  progressPercent: number
  isMaxLevel: boolean
}
