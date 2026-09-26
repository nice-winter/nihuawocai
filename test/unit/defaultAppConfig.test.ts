import { describe, expect, it } from 'vitest'
import { defaultAppConfig, getDefaultAppConfig } from '../../shared/defaultAppConfig'

describe('defaultAppConfig', () => {
  it('顶层与嵌套对象均已冻结', () => {
    expect(Object.isFrozen(defaultAppConfig)).toBe(true)
    expect(Object.isFrozen(defaultAppConfig.admin)).toBe(true)
    expect(Object.isFrozen(defaultAppConfig.game)).toBe(true)
    expect(Object.isFrozen(defaultAppConfig.game.levels)).toBe(true)
    expect(Object.isFrozen(defaultAppConfig.game.room)).toBe(true)
    expect(Object.isFrozen(defaultAppConfig.game.room.banners)).toBe(true)
  })

  it('写入冻结对象会抛错（严格模式）', () => {
    expect(() => {
      defaultAppConfig.name = 'hacked'
    }).toThrow()
    expect(defaultAppConfig.name).toBe('你画我猜')
  })
})

describe('getDefaultAppConfig', () => {
  it('返回深拷贝，修改不影响本体', () => {
    const clone = getDefaultAppConfig()
    expect(clone).not.toBe(defaultAppConfig)
    expect(clone.game).not.toBe(defaultAppConfig.game)

    clone.game.levels[0]!.title = 'hacked'
    clone.name = 'hacked'
    expect(defaultAppConfig.game.levels[0]!.title).not.toBe('hacked')
    expect(defaultAppConfig.name).not.toBe('hacked')
  })

  it('返回的副本可修改（未冻结）', () => {
    const clone = getDefaultAppConfig()
    expect(() => {
      clone.name = 'ok'
      clone.game.room.maxOnlookers = 9
    }).not.toThrow()
    expect(clone.name).toBe('ok')
    expect(clone.game.room.maxOnlookers).toBe(9)
  })
})
