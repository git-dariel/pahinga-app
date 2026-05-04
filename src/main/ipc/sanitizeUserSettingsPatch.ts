import { WORK_STYLES } from '../../shared/constants'
import {
  BREAK_DURATION_OPTIONS,
  BREAK_REMINDER_OPTIONS,
  FOCUS_DURATION_OPTIONS,
  WATER_REMINDER_OPTIONS
} from '../../shared/reminderIntervals'
import type { OverlayMode, UserSettingsUpdate, WorkStyle } from '../../shared/types'

function isWorkStyle(value: string): value is WorkStyle {
  return (WORK_STYLES as readonly string[]).includes(value)
}

function isAllowedFocusDuration(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (FOCUS_DURATION_OPTIONS as readonly number[]).includes(value)
  )
}

function isAllowedBreakDuration(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (BREAK_DURATION_OPTIONS as readonly number[]).includes(value)
  )
}

function isAllowedBreakReminderInterval(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (BREAK_REMINDER_OPTIONS as readonly number[]).includes(value)
  )
}

function isAllowedWaterInterval(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (WATER_REMINDER_OPTIONS as readonly number[]).includes(value)
  )
}

function isOverlayMode(value: unknown): value is OverlayMode {
  return (
    value === 'soft_reminder' || value === 'focused_break_overlay' || value === 'strict_rest_lock'
  )
}

function isValidOverlayMediaPath(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (value.length === 0 || value.length > 1024) return false
  if (value.includes('\0')) return false
  return /\.(gif|mp4)$/i.test(value)
}

export function sanitizeUserSettingsPatch(raw: Record<string, unknown>): UserSettingsUpdate {
  const patch: UserSettingsUpdate = {}

  if (typeof raw.workStyle === 'string' && isWorkStyle(raw.workStyle)) {
    patch.workStyle = raw.workStyle
  }

  if (isAllowedFocusDuration(raw.focusDuration)) {
    patch.focusDuration = raw.focusDuration
  }
  if (isAllowedBreakDuration(raw.breakDuration)) {
    patch.breakDuration = raw.breakDuration
  }
  if (isAllowedBreakReminderInterval(raw.breakInterval)) {
    patch.breakInterval = raw.breakInterval
  }
  if (isAllowedWaterInterval(raw.waterInterval)) {
    patch.waterInterval = raw.waterInterval
  }

  if (typeof raw.stretchRemindersEnabled === 'boolean') {
    patch.stretchRemindersEnabled = raw.stretchRemindersEnabled
  }
  if (typeof raw.eyeRestRemindersEnabled === 'boolean') {
    patch.eyeRestRemindersEnabled = raw.eyeRestRemindersEnabled
  }
  if (typeof raw.notificationsEnabled === 'boolean') {
    patch.notificationsEnabled = raw.notificationsEnabled
  }
  if (typeof raw.startupEnabled === 'boolean') {
    patch.startupEnabled = raw.startupEnabled
  }
  if (typeof raw.restLockModeEnabled === 'boolean') {
    patch.restLockModeEnabled = raw.restLockModeEnabled
  }
  if (isOverlayMode(raw.overlayMode)) {
    patch.overlayMode = raw.overlayMode
  }
  if (typeof raw.overlayMediaPath === 'string') {
    if (raw.overlayMediaPath.trim() === '') {
      patch.overlayMediaPath = ''
    } else if (isValidOverlayMediaPath(raw.overlayMediaPath)) {
      patch.overlayMediaPath = raw.overlayMediaPath
    }
  }
  if (typeof raw.allowEmergencyExit === 'boolean') {
    patch.allowEmergencyExit = raw.allowEmergencyExit
  }
  if (typeof raw.allowOverlaySnooze === 'boolean') {
    patch.allowOverlaySnooze = raw.allowOverlaySnooze
  }
  if (typeof raw.onboardingComplete === 'boolean') {
    patch.onboardingComplete = raw.onboardingComplete
  }

  return patch
}
