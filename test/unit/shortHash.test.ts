import { describe, expect, it } from 'vitest'
import { shortHash } from '../../shared/utils/index'

describe('shortHash', () => {
  it('默认生成 6 位字符串', () => {
    const hash = shortHash()
    expect(hash).toHaveLength(6)
  })

  it('只包含字母和数字', () => {
    const hash = shortHash()
    expect(hash).toMatch(/^[A-Za-z0-9]{6}$/)
  })

  it('uppercase=true 时全大写', () => {
    const hash = shortHash(true)
    expect(hash).toHaveLength(6)
    expect(hash).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('uppercase=false/undefined 时可能含小写', () => {
    // 多跑几次大概率能撞到小写字母
    const hashes = Array.from({ length: 50 }, () => shortHash())
    const hasLower = hashes.some((h) => /[a-z]/.test(h))
    expect(hasLower).toBe(true)
  })

  it('连续调用大概率生成不同结果', () => {
    const results = new Set(Array.from({ length: 100 }, () => shortHash()))
    // 62^6 种可能，100 次全部重复的概率极低
    expect(results.size).toBeGreaterThan(90)
  })
})
