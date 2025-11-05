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

export { useSQLite3Storage }
