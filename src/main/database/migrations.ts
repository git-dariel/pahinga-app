import Database from 'better-sqlite3'

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `)

  const row = db.prepare('SELECT MAX(version) as version FROM schema_migrations').get() as {
    version: number | null
  }
  const currentVersion = row.version ?? 0

  if (currentVersion < 1) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        work_style TEXT DEFAULT 'other',
        focus_duration INTEGER DEFAULT 25,
        break_duration INTEGER DEFAULT 5,
        break_interval INTEGER DEFAULT 25,
        water_interval INTEGER DEFAULT 60,
        stretch_reminders_enabled INTEGER DEFAULT 1,
        eye_rest_reminders_enabled INTEGER DEFAULT 1,
        notifications_enabled INTEGER DEFAULT 1,
        startup_enabled INTEGER DEFAULT 0,
        onboarding_complete INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_minutes INTEGER,
        status TEXT DEFAULT 'in_progress'
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        triggered_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS stretch_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stretch_type TEXT NOT NULL,
        duration_seconds INTEGER,
        completed_at TEXT NOT NULL
      );
    `)

    db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(1)
  }
}
