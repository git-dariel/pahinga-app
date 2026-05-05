import { WORK_STYLES } from '@shared/constants'
import { BREAK_REMINDER_OPTIONS, WATER_REMINDER_OPTIONS } from '@shared/reminderIntervals'
import type { WorkStyle } from '@shared/types'

export function isValidWorkStyle(value: unknown): value is WorkStyle {
  return typeof value === 'string' && (WORK_STYLES as readonly string[]).includes(value)
}

export function isValidBreakReminderMinutes(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (BREAK_REMINDER_OPTIONS as readonly number[]).includes(value)
  )
}

export function isValidWaterReminderMinutes(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    (WATER_REMINDER_OPTIONS as readonly number[]).includes(value)
  )
}

export function validateOnboardingReminders(input: {
  breakInterval: unknown
  waterInterval: unknown
}): { ok: true } | { ok: false; message: string } {
  if (!isValidBreakReminderMinutes(input.breakInterval)) {
    return { ok: false, message: 'Choose a break reminder interval (25, 45, or 60 minutes).' }
  }
  if (!isValidWaterReminderMinutes(input.waterInterval)) {
    return { ok: false, message: 'Choose a water reminder interval (20, 40, or 60 minutes).' }
  }
  return { ok: true }
}
