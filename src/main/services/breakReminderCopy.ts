import type { UserSettings } from '../../shared/types'

/** Modal fields (product guide §4 — suggested type, duration, instruction). */
export function breakReminderModalFields(settings: UserSettings): {
  suggestedType: string
  durationMinutes: number
  instruction: string
} {
  return {
    suggestedType: 'Movement break',
    durationMinutes: Math.max(1, Math.min(60, settings.breakDuration)),
    instruction: 'Stand up, stretch gently, and look away from your screen to rest your eyes.'
  }
}

/** Desktop notification body — exact copy from product guide §4. */
export const BREAK_REMINDER_NOTIFICATION_BODY =
  'Time for a short break. Stand up, stretch, and rest your eyes.'
