import { beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * service 模块加载冒烟测试
 *
 * 循环依赖在 ESM 下常表现为 TDZ / undefined 而非崩溃，
 * 这里断言关键导出存在，抓取「模块加载炸了」级别的回归。
 * 只做加载断言，不注册任何监听器。
 *
 * 实现说明：
 * - service 顶层会调用 Nitro 全局 useStorage，测试环境没有 Nitro，先 stub 再加载
 * - 用变量路径动态 import：测试目录的 tsconfig 缺 Nuxt 别名/自动导入声明，
 *   静态 import 会把 server 文件拖进无别名上下文刷出假类型错误
 *   （与 levelHelper.test.ts 的 #shared 解析失败同源，待统一补 tsconfig.vitest.json）
 */
const load = (path: string) => import(/* @vite-ignore */ path)

beforeAll(() => {
  vi.stubGlobal('useStorage', () => ({
    hasItem: vi.fn(() => Promise.resolve(false)),
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
  }))
})

describe('services 模块加载冒烟', () => {
  it('player 导出完整（含广播与状态更新）', async () => {
    const player = await load('../../server/services/player')
    expect(player.playerEventBus).toBeDefined()
    expect(player.getPlayer).toBeTypeOf('function')
    expect(player.checkPlayerIsInRoom).toBeTypeOf('function')
    expect(player.updatePlayerState).toBeTypeOf('function')
    expect(player.sendToPlayer).toBeTypeOf('function')
    expect(player.sendToAllPlayer).toBeTypeOf('function')
    expect(player.sendToRoom).toBeTypeOf('function')
    expect(player.sendToLobby).toBeTypeOf('function')
  })

  it('room 导出完整（end 已收窄为内部，不再导出）', async () => {
    const room = await load('../../server/services/room')
    expect(room.roomEventBus).toBeDefined()
    expect(room.getRoom).toBeTypeOf('function')
    expect(room.createRoom).toBeTypeOf('function')
    expect(room.joinRoom).toBeTypeOf('function')
    expect(room.leaveRoom).toBeTypeOf('function')
    expect(room.start).toBeTypeOf('function')
    expect(room).not.toHaveProperty('end')
  })

  it('game 导出完整（纯消费者，不再调用 room 函数）', async () => {
    const game = await load('../../server/services/game')
    expect(game.gameStart).toBeTypeOf('function')
    expect(game.handleGuess).toBeTypeOf('function')
    expect(game.getChatContext).toBeTypeOf('function')
    expect(game.handleSketchpad).toBeTypeOf('function')
  })

  it('user 导出完整（含 updatePlayerStats）', async () => {
    const user = await load('../../server/services/user')
    expect(user.getUserData).toBeTypeOf('function')
    expect(user.updateUserData).toBeTypeOf('function')
    expect(user.updatePlayerStats).toBeTypeOf('function')
  })

  it('chat / word / app-config 导出完整', async () => {
    const [chat, word, appConfig] = await Promise.all([
      load('../../server/services/chat'),
      load('../../server/services/word'),
      load('../../server/services/app-config'),
    ])
    expect(chat.say).toBeTypeOf('function')
    expect(word.useWordManager).toBeTypeOf('function')
    expect(appConfig.getAppConfig).toBeTypeOf('function')
  })

  it('wsEventBus 独立于 ws/index 可导入', async () => {
    const { wsEventBus } = await load('../../server/ws/core/events')
    expect(wsEventBus).toBeDefined()
    expect(wsEventBus.on).toBeTypeOf('function')
    expect(wsEventBus.emit).toBeTypeOf('function')
  })
})
