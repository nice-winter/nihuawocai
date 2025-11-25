import type { LevelInfo, UserLevelInfo } from '~~/shared/types/level'
import { defaultAppConfig } from '#shared/defaultAppConfig'

export const defaultLevels: LevelInfo[] = defaultAppConfig.game.levels

export class LevelHelper {
  private levels: LevelInfo[]

  constructor(customLevels?: LevelInfo[]) {
    this.levels = customLevels || defaultLevels
    this.levels.sort((a, b) => a.minScore - b.minScore)
  }

  /**
   * 根据分数获取用户等级信息
   */
  getUserLevelInfo(score: number): UserLevelInfo {
    let currentLevel = this.levels[0]!
    let nextLevel: LevelInfo | null = null

    for (let i = 0; i < this.levels.length; i++) {
      const level = this.levels[i]!
      if (score >= level.minScore) {
        currentLevel = level
        nextLevel = this.levels[i + 1] || null
      } else {
        break
      }
    }

    const isMaxLevel = !nextLevel
    let progress = 0

    if (isMaxLevel) {
      progress = 100
    } else if (nextLevel) {
      const currentLevelScore = currentLevel.minScore
      const nextLevelScore = nextLevel.minScore
      const scoreRange = nextLevelScore - currentLevelScore
      const earnedScore = score - currentLevelScore
      progress = Math.min(100, Math.max(0, (earnedScore / scoreRange) * 100))
    }

    return {
      level: currentLevel.level,
      title: currentLevel.title,
      currentScore: score,
      nextLevelScore: nextLevel?.minScore || null,
      progress: Math.round(progress * 100) / 100,
      isMaxLevel
    }
  }

  /**
   * 获取所有等级信息
   */
  getAllLevels(): LevelInfo[] {
    return [...this.levels]
  }

  /**
   * 获取特定等级信息
   */
  getLevelInfo(level: number): LevelInfo | null {
    return this.levels.find((l) => l.level === level) || null
  }

  /**
   * 获取下一个等级信息
   */
  getNextLevelInfo(currentLevel: number): LevelInfo | null {
    const currentIndex = this.levels.findIndex((l) => l.level === currentLevel)
    return this.levels[currentIndex + 1] || null
  }

  /**
   * 检查分数是否足够升级
   */
  canLevelUp(score: number, currentLevel: number): boolean {
    const nextLevel = this.getNextLevelInfo(currentLevel)
    return nextLevel ? score >= nextLevel.minScore : false
  }

  /**
   * 获取达到特定等级所需的最小分数
   */
  getMinScoreForLevel(level: number): number {
    const levelInfo = this.getLevelInfo(level)
    return levelInfo ? levelInfo.minScore : 0
  }

  /**
   * 获取最大等级
   */
  getMaxLevel(): number {
    return Math.max(...this.levels.map((l) => l.level))
  }
}

export const defaultLevelHelper = new LevelHelper()

export function createLevelHelper(customLevels?: LevelInfo[]): LevelHelper {
  return new LevelHelper(customLevels)
}
