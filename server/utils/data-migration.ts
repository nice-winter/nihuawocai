/**
 * 存量数据键名迁移
 *
 * 字段重命名后，落盘的 JSON（dev: .data/database，prod: sqlite value 列）仍是旧键。
 * 启动时按映射表幂等地把旧键改写为新键：无旧键则跳过，可重复执行。
 *
 * 新增重命名时只需往 KEY_MIGRATIONS 追加条目。
 * @see docs/shared-types.md — 字段命名约定
 */

import { createLogger } from '~~/server/utils/logger'

const logger = createLogger('DataMigration')

/** 迁移表所属的 unstorage 表 */
type MigrationTable = 'app' | 'user_data' | 'word'

interface KeyMigration {
  table: MigrationTable
  /** 父路径（点分隔，`*` 表示数组每一项），空串表示对象根 */
  parent: string
  from: string
  to: string
}

const KEY_MIGRATIONS: KeyMigration[] = [
  // --- app_config ---
  { table: 'app', parent: 'game.room', from: 'passwordMaxLengh', to: 'passwordMaxLength' },
  // 轮次词汇 round→turn（cycle.time 下的计时配置）
  { table: 'app', parent: 'game.room.cycle.time', from: 'roundStartWaitTimeSecond', to: 'turnStartWaitTimeSecond' },
  { table: 'app', parent: 'game.room.cycle.time', from: 'roundDrawingTimeoutSecond', to: 'turnDrawingTimeoutSecond' },
  { table: 'app', parent: 'game.room.cycle.time', from: 'roundDrawingTimeSecond', to: 'turnDrawingTimeSecond' },
  { table: 'app', parent: 'game.room.cycle.time', from: 'maxRoundDrawingTimeSecond', to: 'maxTurnDrawingTimeSecond' },
  { table: 'app', parent: 'game.room.cycle.time', from: 'roundBingoTimeSecond', to: 'bingoShortenToSeconds' },
  { table: 'app', parent: 'game.room.cycle.time', from: 'roundEndWaitTimeSecond', to: 'turnEndWaitTimeSecond' },
  { table: 'app', parent: 'game.room.cycle.time', from: 'cycleEndWaitTimeSecond', to: 'settlementDisplaySeconds' }
]

/** 沿父路径定位目标对象，`*` 会展开为数组的每一项 */
const collectParents = (root: unknown, parent: string): Record<string, unknown>[] => {
  if (parent === '') return [root as Record<string, unknown>]

  let nodes: unknown[] = [root]
  for (const segment of parent.split('.')) {
    const next: unknown[] = []
    for (const node of nodes) {
      if (node === null || typeof node !== 'object') continue
      const value = segment === '*' ? (node as unknown[]) : [(node as Record<string, unknown>)[segment]]
      for (const item of value) {
        if (item !== null && typeof item === 'object') next.push(item)
      }
    }
    nodes = next
  }
  return nodes as Record<string, unknown>[]
}

/** 把对象上的 from 键改名为 to 键；返回是否发生改动 */
const renameKey = (obj: Record<string, unknown>, from: string, to: string) => {
  if (!(from in obj) || to in obj) return false
  obj[to] = obj[from]
  delete obj[from]
  return true
}

/**
 * 执行键名迁移（幂等）
 * 须在 storage 挂载完成之后调用
 */
const runDataMigration = async () => {
  const tables = [...new Set(KEY_MIGRATIONS.map((m) => m.table))]

  for (const table of tables) {
    const migrations = KEY_MIGRATIONS.filter((m) => m.table === table)
    const storage = useStorage(table)
    const keys = await storage.getKeys()

    for (const key of keys) {
      const item = await storage.getItem<Record<string, unknown>>(key)
      if (!item || typeof item !== 'object') continue

      let changed = false
      for (const { parent, from, to } of migrations) {
        for (const target of collectParents(item, parent)) {
          changed = renameKey(target, from, to) || changed
        }
      }

      if (changed) {
        await storage.setItem(key, item)
        logger.info(`已迁移 ${table}:${key}`)
      }
    }
  }
}

export { runDataMigration }
export type { KeyMigration, MigrationTable }
