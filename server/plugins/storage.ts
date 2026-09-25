import { createDatabase } from 'db0'
import dbDriver from 'unstorage/drivers/db0'
import fsDriver from 'unstorage/drivers/fs'
import sqlite from 'db0/connectors/node-sqlite'
import { createLogger } from '~~/server/utils/logger'
import { runDataMigration } from '~~/server/utils/data-migration'

const logger = createLogger('Storage')

export default defineNitroPlugin(() => {
  const databaseName = 'database'
  const storage = useStorage()

  // 所有表名
  const tables = ['app', 'session', 'word', 'user_data']

  // SQLite 原生 db0 实例
  const database = createDatabase(
    sqlite({
      name: databaseName
    })
  )

  const sqliteDriver = (table: string) =>
    dbDriver({
      database,
      tableName: table
    })

  const fsDevDriver = (table: string) =>
    fsDriver({
      base: `./.data/${databaseName}/${table}`
    })

  // 根据是否开发模式，使用对应的 Driver
  // 生产模式：sqlite
  // 开发模式：fs（便于调试）
  const pickDriver = import.meta.dev ? fsDevDriver : sqliteDriver

  // 自动挂载
  tables.forEach((t) => {
    storage.mount(t, pickDriver(t))
  })

  // 存量数据键名迁移（须在表挂载之后执行；插件同步启动，迁移异步完成）
  runDataMigration().catch((err) => logger.error('存量数据迁移失败', err))

  const driverName = import.meta.dev ? 'fs' : 'sqlite'
  const tree = tables
    .map((t, i) => `${i === tables.length - 1 ? '└── ' : '├── '}${t}`)
    .join('\n')
  logger.info(`✅ 存储层就绪 · ${driverName} · ${tables.length} 张表:\n${tree}`)
})
