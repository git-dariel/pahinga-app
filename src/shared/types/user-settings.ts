export type WorkStyle =
  | 'developer'
  | 'student'
  | 'office_worker'
  | 'freelancer'
  | 'designer_editor'
  | 'other'

export type OverlayMode = 'soft_reminder' | 'focused_break_overlay' | 'strict_rest_lock'

export interface UserSettings {
  id: number
  workStyle: WorkStyle
  focusDuration: number
  breakDuration: number
  breakInterval: number
  waterInterval: number
  stretchRemindersEnabled: boolean
  eyeRestRemindersEnabled: boolean
  notificationsEnabled: boolean
  startupEnabled: boolean
  restLockModeEnabled: boolean
  overlayMode: OverlayMode
  overlayMediaPath: string | null
  allowEmergencyExit: boolean
  allowOverlaySnooze: boolean
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

export type UserSettingsUpdate = Partial<
  Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>
>
