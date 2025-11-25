import { createDatabase } from 'db0'
import dbDriver from 'unstorage/drivers/db0'
import fsDriver from 'unstorage/drivers/fs'
import sqlite from 'db0/connectors/node-sqlite'

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
})
