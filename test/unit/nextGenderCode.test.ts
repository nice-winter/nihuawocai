import { describe, expect, it } from 'vitest'
import { nextGenderCode } from '../../shared/utils/gender'
import type { Gender } from '../../shared/types/gender'

const gender = (code: number): Gender => ({ label: `g${code}`, code, icon: '', color: '' })

describe('nextGenderCode', () => {
  it('空表返回 0', () => {
    expect(nextGenderCode([])).toBe(0)
  })

  it('取现有最大 code + 1', () => {
    expect(nextGenderCode([gender(0), gender(1), gender(2)])).toBe(3)
  })

  it('删除中间项后新增不与已有 code 重复', () => {
    // 0、1、2 删掉 1 → 剩 0、2；用 length 会得到 2（重复），用 max+1 得到 3
    const genders = [gender(0), gender(2)]
    expect(nextGenderCode(genders)).toBe(3)
  })

  it('code 不按序时仍取最大值', () => {
    expect(nextGenderCode([gender(5), gender(1), gender(9)])).toBe(10)
  })
})
