import { createDatabase } from 'db0'
import { createStorage } from 'unstorage'
import dbDriver from 'unstorage/drivers/db0'
import sqlite from 'db0/connectors/node-sqlite'

const database = createDatabase(
  sqlite({
    name: 'nihuawocai'
  })
)

const useSQLite3Storage = (name?: string) => {
  return createStorage({
    driver: dbDriver({
      database,
      tableName: name
    })
  })
}

/**
 * 使用持久化 KV 储存，可根据是否开发环境选择使用 sqlite 还是 fs 驱动
 * @param name 储存名称
 */
const useAppStorage = (name?: string) => {
  if (name) name = 'app'
  return import.meta.dev ? useStorage(name) : useSQLite3Storage(name)
}

export { useSQLite3Storage, useAppStorage }
