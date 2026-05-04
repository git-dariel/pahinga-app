export type WorkStyle =
  | 'developer'
  | 'student'
  | 'office_worker'
  | 'freelancer'
  | 'designer_editor'
  | 'other'

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
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

export type UserSettingsUpdate = Partial<
  Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>
>
