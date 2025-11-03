import type { LevelInfo, UserLevelInfo } from '#shared/interfaces/level'

export const defaultLevels: LevelInfo[] = [
  { level: 1, minScore: 0, title: '' },
  { level: 2, minScore: 20, title: '' },
  { level: 3, minScore: 50, title: '绘画新人' },
  { level: 4, minScore: 80, title: '绘画新人' },
  { level: 5, minScore: 120, title: '绘画新人' },
  { level: 6, minScore: 160, title: '绘画新人' },
  { level: 7, minScore: 200, title: '粗通皮毛' },
  { level: 8, minScore: 250, title: '粗通皮毛' },
  { level: 9, minScore: 300, title: '粗通皮毛' },
  { level: 10, minScore: 350, title: '粗通皮毛' },
  { level: 11, minScore: 400, title: '粗通皮毛' },
  { level: 12, minScore: 500, title: '崭露头角' },
  { level: 13, minScore: 600, title: '崭露头角' },
  { level: 14, minScore: 700, title: '崭露头角' },
  { level: 15, minScore: 800, title: '略有小成' },
  { level: 16, minScore: 900, title: '略有小成' },
  { level: 17, minScore: 1000, title: '略有小成' },
  { level: 18, minScore: 1200, title: '略有小成' },
  { level: 19, minScore: 1400, title: '略有小成' },
  { level: 20, minScore: 1600, title: '略有小成' },
  { level: 21, minScore: 1800, title: '渐入佳境' },
  { level: 22, minScore: 2000, title: '渐入佳境' },
  { level: 23, minScore: 2250, title: '渐入佳境' },
  { level: 24, minScore: 2500, title: '渐入佳境' },
  { level: 25, minScore: 2750, title: '渐入佳境' },
  { level: 26, minScore: 3000, title: '渐入佳境' },
  { level: 27, minScore: 3300, title: '出类拔萃' },
  { level: 28, minScore: 3600, title: '出类拔萃' },
  { level: 29, minScore: 4000, title: '出类拔萃' },
  { level: 30, minScore: 4500, title: '出类拔萃' },
  { level: 31, minScore: 5000, title: '出类拔萃' },
  { level: 32, minScore: 5500, title: '出类拔萃' },
  { level: 33, minScore: 6000, title: '自成一派' },
  { level: 34, minScore: 7000, title: '自成一派' },
  { level: 35, minScore: 8000, title: '自成一派' },
  { level: 36, minScore: 9000, title: '自成一派' },
  { level: 37, minScore: 10000, title: '自成一派' },
  { level: 38, minScore: 12000, title: '登峰造极' },
  { level: 39, minScore: 15000, title: '登峰造极' },
  { level: 40, minScore: 20000, title: '登峰造极' },
  { level: 41, minScore: 25000, title: '登峰造极' },
  { level: 42, minScore: 30000, title: '出神入化' },
  { level: 43, minScore: 35000, title: '出神入化' },
  { level: 44, minScore: 40000, title: '出神入化' },
  { level: 45, minScore: 50000, title: '出神入化' },
  { level: 46, minScore: 60000, title: '出神入化' },
  { level: 47, minScore: 70000, title: '空前绝后' },
  { level: 48, minScore: 80000, title: '空前绝后' },
  { level: 49, minScore: 90000, title: '空前绝后' },
  { level: 50, minScore: 100000, title: '空前绝后' },
  { level: 51, minScore: 120000, title: '空前绝后' },
  { level: 52, minScore: 160000, title: '空前绝后' },
  { level: 53, minScore: 200000, title: '空前绝后' },
  { level: 54, minScore: 240000, title: '空前绝后' },
  { level: 55, minScore: 280000, title: '空前绝后' },
  { level: 56, minScore: 320000, title: '空前绝后' },
  { level: 57, minScore: 400000, title: '空前绝后' },
  { level: 58, minScore: 480000, title: '空前绝后' },
  { level: 59, minScore: 560000, title: '空前绝后' },
  { level: 60, minScore: 800000, title: '空前绝后' }
]

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
