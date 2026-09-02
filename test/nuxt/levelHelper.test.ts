import { describe, expect, it } from 'vitest'
import { LevelHelper, createLevelHelper, defaultLevelHelper } from '#shared/utils/levelHelper'
import type { LevelInfo } from '#shared/types/level'

/** 简化的自定义等级表，方便测试 */
const testLevels: LevelInfo[] = [
  { level: 1, minScore: 0, title: '新手' },
  { level: 2, minScore: 10, title: '学徒' },
  { level: 3, minScore: 30, title: '熟手' },
  { level: 4, minScore: 60, title: '大师' },
]

describe('LevelHelper', () => {
  describe('构造函数', () => {
    it('使用自定义等级表', () => {
      const helper = new LevelHelper(testLevels)
      expect(helper.getAllLevels()).toHaveLength(4)
    })

    it('等级表按 minScore 升序排列', () => {
      const shuffled = [testLevels[2]!, testLevels[0]!, testLevels[3]!, testLevels[1]!]
      const helper = new LevelHelper(shuffled)
      const levels = helper.getAllLevels()
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i]!.minScore).toBeGreaterThanOrEqual(levels[i - 1]!.minScore)
      }
    })
  })

  describe('getUserLevelInfo', () => {
    const helper = new LevelHelper(testLevels)

    it('分数 0 → 最低等级', () => {
      const info = helper.getUserLevelInfo(0)
      expect(info.level).toBe(1)
      expect(info.title).toBe('新手')
      expect(info.isMaxLevel).toBe(false)
    })

    it('刚好达到某等级的 minScore → 该等级', () => {
      const info = helper.getUserLevelInfo(30)
      expect(info.level).toBe(3)
      expect(info.title).toBe('熟手')
    })

    it('分数在两个等级之间 → 较低等级', () => {
      const info = helper.getUserLevelInfo(45)
      expect(info.level).toBe(3)
      expect(info.title).toBe('熟手')
    })

    it('超过最高等级 → 最高等级 + isMaxLevel=true', () => {
      const info = helper.getUserLevelInfo(9999)
      expect(info.level).toBe(4)
      expect(info.title).toBe('大师')
      expect(info.isMaxLevel).toBe(true)
      expect(info.progress).toBe(100)
      expect(info.nextLevelScore).toBeNull()
    })

    it('progress 在两个等级之间正确计算', () => {
      // 等级3 minScore=30, 等级4 minScore=60, 差值30
      // 分数45 → (45-30)/30 * 100 = 50%
      const info = helper.getUserLevelInfo(45)
      expect(info.progress).toBe(50)
    })

    it('刚好在等级起点 → progress=0', () => {
      const info = helper.getUserLevelInfo(30)
      expect(info.progress).toBe(0)
    })

    it('刚好在下一等级起点前 → progress 接近 100', () => {
      const info = helper.getUserLevelInfo(59)
      // (59-30)/30 * 100 = 96.67%
      expect(info.progress).toBeCloseTo(96.67, 1)
    })

    it('currentScore 正确反映输入分数', () => {
      expect(helper.getUserLevelInfo(42).currentScore).toBe(42)
    })

    it('nextLevelScore 指向下一等级的 minScore', () => {
      const info = helper.getUserLevelInfo(15)
      expect(info.nextLevelScore).toBe(30) // 等级3 的 minScore
    })
  })

  describe('getLevelInfo', () => {
    const helper = new LevelHelper(testLevels)

    it('返回存在的等级信息', () => {
      const info = helper.getLevelInfo(2)
      expect(info).toEqual({ level: 2, minScore: 10, title: '学徒' })
    })

    it('不存在的等级返回 null', () => {
      expect(helper.getLevelInfo(99)).toBeNull()
    })
  })

  describe('getNextLevelInfo', () => {
    const helper = new LevelHelper(testLevels)

    it('返回下一等级', () => {
      const next = helper.getNextLevelInfo(2)
      expect(next?.level).toBe(3)
    })

    it('最高等级返回 null', () => {
      expect(helper.getNextLevelInfo(4)).toBeNull()
    })

    it('不存在的等级：findIndex 返回 -1，回退到第一个等级', () => {
      const result = helper.getNextLevelInfo(99)
      expect(result?.level).toBe(1)
    })
  })

  describe('canLevelUp', () => {
    const helper = new LevelHelper(testLevels)

    it('分数足够 → true', () => {
      expect(helper.canLevelUp(30, 2)).toBe(true)
    })

    it('分数不足 → false', () => {
      expect(helper.canLevelUp(20, 2)).toBe(false)
    })

    it('最高等级 → false（没有下一等级）', () => {
      expect(helper.canLevelUp(99999, 4)).toBe(false)
    })
  })

  describe('getMinScoreForLevel', () => {
    const helper = new LevelHelper(testLevels)

    it('返回正确分数', () => {
      expect(helper.getMinScoreForLevel(3)).toBe(30)
    })

    it('不存在的等级返回 0', () => {
      expect(helper.getMinScoreForLevel(99)).toBe(0)
    })
  })

  describe('getMaxLevel', () => {
    it('返回最高等级数', () => {
      const helper = new LevelHelper(testLevels)
      expect(helper.getMaxLevel()).toBe(4)
    })
  })

  describe('createLevelHelper', () => {
    it('返回 LevelHelper 实例', () => {
      const helper = createLevelHelper(testLevels)
      expect(helper).toBeInstanceOf(LevelHelper)
    })
  })

  describe('defaultLevelHelper', () => {
    it('使用默认等级表，有 60 个等级', () => {
      expect(defaultLevelHelper.getAllLevels()).toHaveLength(60)
    })

    it('0 分 → 等级 1', () => {
      const info = defaultLevelHelper.getUserLevelInfo(0)
      expect(info.level).toBe(1)
    })

    it('800000 分 → 等级 60（最高等级）', () => {
      const info = defaultLevelHelper.getUserLevelInfo(800000)
      expect(info.level).toBe(60)
      expect(info.isMaxLevel).toBe(true)
    })
  })
})
