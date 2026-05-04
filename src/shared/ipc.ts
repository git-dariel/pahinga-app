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
  END: 'session:end'
} as const

export type UserSettingsUpdatePayload = UserSettingsUpdate
