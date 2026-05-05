import type { UserSettingsUpdate } from './types'

/** Phase 2 IPC contract (roadmap + product guide). */
export const SETTINGS_IPC_CHANNELS = {
  GET: 'settings:get',
  UPDATE: 'settings:update',
  IS_ONBOARDING_COMPLETE: 'settings:isOnboardingComplete',
  /** Native file dialog for break overlay GIF/MP4 (Phase 6). */
  PICK_OVERLAY_MEDIA: 'settings:pickOverlayMedia',
  /** Phase 10: reset all preferences back to their defaults. */
  RESET_TO_DEFAULTS: 'settings:resetToDefaults'
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

/** Phase 7 water reminder — renderer invokes; main also pushes `WATER_REMINDER_EVENT`. */
export const WATER_REMINDER_IPC_CHANNELS = {
  COMPLETE: 'water-reminder:complete',
  SNOOZE: 'water-reminder:snooze',
  SKIP: 'water-reminder:skip'
} as const

/** Main process → renderer (preload: `api.pahinga.onWaterReminderTrigger`). */
export const WATER_REMINDER_EVENT = 'water-reminder:triggered' as const

/** Break overlay window + controls (Phase 6). */
export const OVERLAY_IPC_CHANNELS = {
  OPEN_BREAK: 'overlay:openBreak',
  CLOSE_BREAK: 'overlay:closeBreak',
  /** Pull last payload (fixes race if push happened before renderer subscribed). */
  GET_BREAK_PAYLOAD: 'overlay:getBreakPayload',
  START_BREAK: 'overlay:startBreak',
  SNOOZE_BREAK: 'overlay:snoozeBreak',
  EMERGENCY_EXIT: 'overlay:emergencyExit',
  COMPLETE_BREAK: 'overlay:completeBreak',
  GET_NEKO_URLS: 'overlay:getNekoUrls'
} as const

/** Main process -> overlay renderer payload push. */
export const BREAK_OVERLAY_EVENT = 'overlay:breakTriggered' as const

/** Phase 8 stretch guide — renderer invokes to save and fetch stretch logs. */
export const STRETCH_IPC_CHANNELS = {
  COMPLETE: 'stretch:complete',
  GET_TODAY: 'stretch:getToday'
} as const

/** Phase 9 daily summary — renderer invokes for summary data. */
export const SUMMARY_IPC_CHANNELS = {
  GET_TODAY: 'summary:getToday',
  GET_YESTERDAY: 'summary:getYesterday',
  GET_LAST_SEVEN_DAYS: 'summary:getLastSevenDays'
} as const

/** Phase 11 desktop notification status and reminder previews. */
export const NOTIFICATION_IPC_CHANNELS = {
  GET_STATUS: 'notification:getStatus',
  PREVIEW: 'notification:preview'
} as const

/** Phase 11 tray status for dashboard visibility. */
export const TRAY_IPC_CHANNELS = {
  GET_STATUS: 'tray:getStatus'
} as const

export type UserSettingsUpdatePayload = UserSettingsUpdate
