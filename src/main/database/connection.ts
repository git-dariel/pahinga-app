import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { runMigrations } from './migrations'
import { seedDefaultUserSettings } from './seed'
import { logger } from '../utils/logger'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = join(app.getPath('userData'), 'pahinga.db')
    try {
      db = new Database(dbPath)
      db.pragma('journal_mode = WAL')
      db.pragma('foreign_keys = ON')
      runMigrations(db)
      seedDefaultUserSettings(db)
    } catch (error) {
      db?.close()
      db = null
      logger.error(`Could not initialize local database at ${dbPath}`, error)
      throw new Error('Pahinga could not open its local database. Please restart the app.')
    }
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
