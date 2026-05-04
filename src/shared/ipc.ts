import type { UserSettingsUpdate } from './types'

/** Phase 2 IPC contract (roadmap + product guide). */
export const SETTINGS_IPC_CHANNELS = {
  GET: 'settings:get',
  UPDATE: 'settings:update',
  IS_ONBOARDING_COMPLETE: 'settings:isOnboardingComplete'
} as const

export type UserSettingsUpdatePayload = UserSettingsUpdate
