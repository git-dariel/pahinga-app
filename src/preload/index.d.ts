import { ElectronAPI } from '@electron-toolkit/preload'
import type { UserSettings, UserSettingsUpdate } from '../shared/types'

export interface PahingaPreloadApi {
  getSettings(): Promise<UserSettings>
  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings>
  isOnboardingComplete(): Promise<boolean>
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
