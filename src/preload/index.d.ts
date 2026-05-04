import { ElectronAPI } from '@electron-toolkit/preload'
import type { DashboardToday, UserSettings, UserSettingsUpdate } from '../shared/types'

export interface PahingaPreloadApi {
  getSettings(): Promise<UserSettings>
  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings>
  isOnboardingComplete(): Promise<boolean>
  getDashboardToday(): Promise<DashboardToday>
  sessionStart(payload?: { plannedMinutes?: number }): Promise<DashboardToday>
  sessionPause(): Promise<DashboardToday>
  sessionResume(): Promise<DashboardToday>
  sessionEnd(): Promise<DashboardToday>
  sessionCancel(): Promise<DashboardToday>
  sessionSkip(): Promise<DashboardToday>
}

export interface AppPreloadApi {
  pahinga: PahingaPreloadApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppPreloadApi
  }
}
