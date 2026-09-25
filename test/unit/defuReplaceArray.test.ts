import { describe, expect, it } from 'vitest'
import { defuReplaceArray } from '../../shared/utils/defu'

describe('defuReplaceArray', () => {
  it('数组字段直接替换而非拼接', () => {
    const base = { list: [1, 2, 3] }
    const override = { list: [9] }
    expect(defuReplaceArray(override, base)).toEqual({ list: [9] })
  })

  it('override 数组为空时清空原数组', () => {
    const base = { list: [1, 2, 3] }
    const override = { list: [] }
    expect(defuReplaceArray(override, base)).toEqual({ list: [] })
  })

  it('未传的数组字段保留原值', () => {
    const base = { list: [1, 2], other: [3] }
    const override = { list: [9] }
    expect(defuReplaceArray(override, base)).toEqual({ list: [9], other: [3] })
  })

  it('嵌套对象中的数组也替换', () => {
    const base = { game: { levels: [{ id: 1 }, { id: 2 }] } }
    const override = { game: { levels: [{ id: 9 }] } }
    expect(defuReplaceArray(override, base)).toEqual({ game: { levels: [{ id: 9 }] } })
  })

  it('嵌套对象未传的字段递归保留', () => {
    const base = { game: { levels: [{ id: 1 }], count: 5 } }
    const override = { game: { levels: [{ id: 9 }] } }
    expect(defuReplaceArray(override, base)).toEqual({ game: { levels: [{ id: 9 }], count: 5 } })
  })

  it('标量字段 override 优先', () => {
    const base = { name: 'default', count: 1 }
    const override = { name: 'custom' }
    expect(defuReplaceArray(override, base)).toEqual({ name: 'custom', count: 1 })
  })

  it('空 override 返回 base', () => {
    const base = { list: [1], name: 'a' }
    expect(defuReplaceArray({}, base)).toEqual({ list: [1], name: 'a' })
  })
})
