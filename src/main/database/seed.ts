import type Database from 'better-sqlite3'
import { wrapRepositoryError } from '../repositories/errors'

/**
 * Ensures a single default settings row exists (MVP single-user local profile).
 */
export function seedDefaultUserSettings(db: Database.Database): void {
  try {
    const row = db.prepare(`SELECT id FROM user_settings LIMIT 1`).get() as { id: number } | undefined
    if (!row) {
      db.prepare(`INSERT INTO user_settings DEFAULT VALUES`).run()
    }
  } catch (cause) {
    throw wrapRepositoryError('seedDefaultUserSettings', cause)
  }
}
