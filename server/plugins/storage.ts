import { createDatabase } from 'db0'
import dbDriver from 'unstorage/drivers/db0'
import fsDriver from 'unstorage/drivers/fs'
import sqlite from 'db0/connectors/node-sqlite'

export default defineNitroPlugin(() => {
  const databaseName = 'database'
  const storage = useStorage()

  const database = createDatabase(
    sqlite({
      name: databaseName
    })
  )
  const sqliteDriver = (name?: string) => {
    return dbDriver({
      database,
      tableName: name
    })
  }

  const mountPoints = [
    {
      name: 'app',
      driver: sqliteDriver('app')
    },
    {
      name: 'session',
      driver: sqliteDriver('session')
    },
    {
      name: 'word',
      driver: sqliteDriver('word')
    },
    {
      name: 'user_data',
      driver: sqliteDriver('user_data')
    }
  ]

  const mountPointsDevOnly = [
    {
      name: 'app',
      driver: fsDriver({
        base: `./.data/${databaseName}/app`
      })
    },
    {
      name: 'session',
      driver: fsDriver({
        base: `./.data/${databaseName}/session`
      })
    },
    {
      name: 'word',
      driver: fsDriver({
        base: `./.data/${databaseName}/word`
      })
    },
    {
      name: 'user_data',
      driver: fsDriver({
        base: `./.data/${databaseName}/user_data`
      })
    }
  ]

  ;(!import.meta.dev ? mountPoints : mountPointsDevOnly).forEach((mountPoint) =>
    storage.mount(mountPoint.name, mountPoint.driver)
  )
})
