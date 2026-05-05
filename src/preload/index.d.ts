import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  BreakOverlayOpenReason,
  BreakOverlayTriggerPayload,
  BreakReminderTriggerPayload,
  DashboardToday,
  StretchLog,
  StretchType,
  UserSettings,
  UserSettingsUpdate,
  WaterReminderTriggerPayload
} from '../shared/types'

export interface PahingaPreloadApi {
  getSettings(): Promise<UserSettings>
  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings>
  pickOverlayMedia(): Promise<string | null>
  isOnboardingComplete(): Promise<boolean>
  getDashboardToday(): Promise<DashboardToday>
  sessionStart(payload?: { plannedMinutes?: number }): Promise<DashboardToday>
  sessionPause(): Promise<DashboardToday>
  sessionResume(): Promise<DashboardToday>
  sessionEnd(): Promise<DashboardToday>
  sessionCancel(): Promise<DashboardToday>
  sessionSkip(): Promise<DashboardToday>
  reminderComplete(reminderId: number): Promise<DashboardToday>
  reminderSnooze(reminderId: number): Promise<DashboardToday>
  reminderSkip(reminderId: number): Promise<DashboardToday>
  onBreakReminderTrigger(callback: (payload: BreakReminderTriggerPayload) => void): () => void
  waterReminderComplete(reminderId: number): Promise<DashboardToday>
  waterReminderSnooze(reminderId: number): Promise<DashboardToday>
  waterReminderSkip(reminderId: number): Promise<DashboardToday>
  onWaterReminderTrigger(callback: (payload: WaterReminderTriggerPayload) => void): () => void
  stretchComplete(stretchType: StretchType, durationSeconds: number): Promise<StretchLog>
  stretchGetToday(): Promise<StretchLog[]>
  overlayOpenBreak(reason: BreakOverlayOpenReason): Promise<BreakOverlayTriggerPayload>
  overlayCloseBreak(): Promise<boolean>
  overlayStartBreak(reminderId: number): Promise<boolean>
  overlaySnoozeBreak(reminderId: number): Promise<DashboardToday>
  overlayEmergencyExit(reminderId: number): Promise<DashboardToday>
  overlayCompleteBreak(reminderId: number): Promise<DashboardToday>
  onOverlayBreakTriggered(callback: (payload: BreakOverlayTriggerPayload) => void): () => void
  getBreakOverlayPayload(): Promise<BreakOverlayTriggerPayload | null>
  getNekoUrls(): Promise<{ intro: string; loop: string }>
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
