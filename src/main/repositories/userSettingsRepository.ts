import type Database from 'better-sqlite3'
import type { UserSettings, UserSettingsUpdate, WorkStyle } from '../../shared/types'
import { WORK_STYLES } from '../../shared/constants'
import { wrapRepositoryError } from './errors'

type UserSettingsRow = {
  id: number
  work_style: string
  focus_duration: number
  break_duration: number
  break_interval: number
  water_interval: number
  stretch_reminders_enabled: number
  eye_rest_reminders_enabled: number
  notifications_enabled: number
  startup_enabled: number
  onboarding_complete: number
  created_at: string
  updated_at: string
}

function intToBool(v: number): boolean {
  return v === 1
}

function boolToInt(v: boolean): number {
  return v ? 1 : 0
}

function normalizeWorkStyle(value: string): WorkStyle {
  if (WORK_STYLES.includes(value as WorkStyle)) {
    return value as WorkStyle
  }
  return 'other'
}

function mapRow(row: UserSettingsRow): UserSettings {
  return {
    id: row.id,
    workStyle: normalizeWorkStyle(row.work_style),
    focusDuration: row.focus_duration,
    breakDuration: row.break_duration,
    breakInterval: row.break_interval,
    waterInterval: row.water_interval,
    stretchRemindersEnabled: intToBool(row.stretch_reminders_enabled),
    eyeRestRemindersEnabled: intToBool(row.eye_rest_reminders_enabled),
    notificationsEnabled: intToBool(row.notifications_enabled),
    startupEnabled: intToBool(row.startup_enabled),
    onboardingComplete: intToBool(row.onboarding_complete),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function createUserSettingsRepository(db: Database.Database) {
  const selectFirst = db.prepare(`
    SELECT * FROM user_settings ORDER BY id ASC LIMIT 1
  `)

  const insertDefault = db.prepare(`
    INSERT INTO user_settings DEFAULT VALUES
  `)

  const updateDynamic = db.prepare(`
    UPDATE user_settings SET
      work_style = COALESCE(@work_style, work_style),
      focus_duration = COALESCE(@focus_duration, focus_duration),
      break_duration = COALESCE(@break_duration, break_duration),
      break_interval = COALESCE(@break_interval, break_interval),
      water_interval = COALESCE(@water_interval, water_interval),
      stretch_reminders_enabled = COALESCE(@stretch_reminders_enabled, stretch_reminders_enabled),
      eye_rest_reminders_enabled = COALESCE(@eye_rest_reminders_enabled, eye_rest_reminders_enabled),
      notifications_enabled = COALESCE(@notifications_enabled, notifications_enabled),
      startup_enabled = COALESCE(@startup_enabled, startup_enabled),
      onboarding_complete = COALESCE(@onboarding_complete, onboarding_complete),
      updated_at = datetime('now')
    WHERE id = @id
  `)

  return {
    getFirst(): UserSettings | null {
      try {
        const row = selectFirst.get() as UserSettingsRow | undefined
        return row ? mapRow(row) : null
      } catch (cause) {
        throw wrapRepositoryError('user_settings.getFirst', cause)
      }
    },

    getOrCreate(): UserSettings {
      try {
        let row = selectFirst.get() as UserSettingsRow | undefined
        if (!row) {
          insertDefault.run()
          row = selectFirst.get() as UserSettingsRow | undefined
        }
        if (!row) {
          throw new Error('user_settings row missing after insert')
        }
        return mapRow(row)
      } catch (cause) {
        throw wrapRepositoryError('user_settings.getOrCreate', cause)
      }
    },

    update(id: number, patch: UserSettingsUpdate): UserSettings {
      try {
        if (patch.workStyle !== undefined && !WORK_STYLES.includes(patch.workStyle)) {
          throw new Error('Invalid work style')
        }

        const params = {
          id,
          work_style: patch.workStyle ?? null,
          focus_duration: patch.focusDuration ?? null,
          break_duration: patch.breakDuration ?? null,
          break_interval: patch.breakInterval ?? null,
          water_interval: patch.waterInterval ?? null,
          stretch_reminders_enabled:
            patch.stretchRemindersEnabled !== undefined
              ? boolToInt(patch.stretchRemindersEnabled)
              : null,
          eye_rest_reminders_enabled:
            patch.eyeRestRemindersEnabled !== undefined
              ? boolToInt(patch.eyeRestRemindersEnabled)
              : null,
          notifications_enabled:
            patch.notificationsEnabled !== undefined ? boolToInt(patch.notificationsEnabled) : null,
          startup_enabled: patch.startupEnabled !== undefined ? boolToInt(patch.startupEnabled) : null,
          onboarding_complete:
            patch.onboardingComplete !== undefined ? boolToInt(patch.onboardingComplete) : null
        }

        updateDynamic.run(params)

        const row = db.prepare('SELECT * FROM user_settings WHERE id = ?').get(id) as UserSettingsRow | undefined
        if (!row) {
          throw new Error('user_settings not found after update')
        }
        return mapRow(row)
      } catch (cause) {
        throw wrapRepositoryError('user_settings.update', cause)
      }
    }
  }
}

export type UserSettingsRepository = ReturnType<typeof createUserSettingsRepository>
