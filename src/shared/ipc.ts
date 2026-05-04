import type { UserSettingsUpdate } from './types'

/** Phase 2 IPC contract (roadmap + product guide). */
export const SETTINGS_IPC_CHANNELS = {
  GET: 'settings:get',
  UPDATE: 'settings:update',
  IS_ONBOARDING_COMPLETE: 'settings:isOnboardingComplete'
} as const

/** Phase 3 dashboard IPC. */
export const DASHBOARD_IPC_CHANNELS = {
  GET_TODAY: 'dashboard:getToday'
} as const

/** Focus session control (dashboard + Phase 4 timer). */
export const SESSION_IPC_CHANNELS = {
  START: 'session:start',
  PAUSE: 'session:pause',
  RESUME: 'session:resume',
  /** Mark session completed (timer finished or explicit). Idempotent. */
  END: 'session:end',
  /** User stops early — saved as cancelled. */
  CANCEL: 'session:cancel',
  /** Early exit recorded as skipped (same timing rules as cancel). */
  SKIP: 'session:skip'
} as const

/** Phase 5 break reminder — renderer invokes; main may also push `BREAK_REMINDER_EVENT`. */
export const REMINDER_IPC_CHANNELS = {
  COMPLETE: 'reminder:complete',
  SNOOZE: 'reminder:snooze',
  SKIP: 'reminder:skip'
} as const

/** Main process → renderer (preload: `api.pahinga.onBreakReminderTrigger`). */
export const BREAK_REMINDER_EVENT = 'break-reminder:triggered' as const

export type UserSettingsUpdatePayload = UserSettingsUpdate
