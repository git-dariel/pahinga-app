import type Database from 'better-sqlite3'
import type { UserSettings } from '../../shared/types'
import { createUserSettingsRepository } from '../repositories/userSettingsRepository'
import { sanitizeUserSettingsPatch } from '../ipc/sanitizeUserSettingsPatch'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createSettingsService(db: Database.Database) {
  const userSettings = createUserSettingsRepository(db)

  return {
    get(): UserSettings {
      return userSettings.getOrCreate()
    },

    isOnboardingComplete(): boolean {
      return userSettings.getOrCreate().onboardingComplete
    },

    update(rawPatch: unknown): UserSettings {
      if (!isPlainObject(rawPatch)) {
        throw new Error('Invalid settings payload')
      }
      const sanitized = sanitizeUserSettingsPatch(rawPatch)
      if (Object.keys(sanitized).length === 0) {
        throw new Error('No valid settings fields to update')
      }
      const current = userSettings.getOrCreate()
      return userSettings.update(current.id, sanitized)
    },

    resetToDefaults(): UserSettings {
      const current = userSettings.getOrCreate()
      return userSettings.update(current.id, {
        focusDuration: 25,
        breakDuration: 5,
        breakInterval: 25,
        waterInterval: 60,
        stretchRemindersEnabled: true,
        eyeRestRemindersEnabled: true,
        notificationsEnabled: true,
        startupEnabled: false,
        restLockModeEnabled: false,
        overlayMode: 'soft_reminder',
        allowEmergencyExit: true,
        allowOverlaySnooze: true
      })
    }
  }
}

export type SettingsService = ReturnType<typeof createSettingsService>
