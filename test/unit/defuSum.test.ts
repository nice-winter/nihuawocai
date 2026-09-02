import { describe, expect, it } from 'vitest'
import { defuSum } from '../../shared/utils/defu'

describe('defuSum', () => {
  it('数字字段求和', () => {
    const base = { score: 10, count: 5 }
    const override = { score: 20 }
    expect(defuSum(override, base)).toEqual({ score: 30, count: 5 })
  })

  it('多个数字字段分别求和', () => {
    const base = { a: 1, b: 2, c: 3 }
    const override = { a: 10, b: 20 }
    expect(defuSum(override, base)).toEqual({ a: 11, b: 22, c: 3 })
  })

  it('非数字字段按 defu 默认行为处理（不覆盖）', () => {
    const base = { name: 'default', score: 10 }
    const override = { name: 'custom' }
    const result = defuSum(override, base)
    expect(result.name).toBe('custom')
  })

  it('override 中的新字段保留', () => {
    const base = { score: 10 }
    const override = { score: 5, bonus: 100 }
    expect(defuSum(override, base)).toEqual({ score: 15, bonus: 100 })
  })

  it('嵌套对象中数字也求和', () => {
    const base = { stats: { wins: 10, losses: 3 } }
    const override = { stats: { wins: 5 } }
    expect(defuSum(override, base)).toEqual({ stats: { wins: 15, losses: 3 } })
  })

  it('空 override 返回 base', () => {
    const base = { score: 100 }
    expect(defuSum({}, base)).toEqual({ score: 100 })
  })
})
