import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  AppInfo,
  BreakOverlayOpenReason,
  BreakOverlayTriggerPayload,
  BreakReminderTriggerPayload,
  DashboardToday,
  DesktopNotificationStatus,
  NotificationPreviewKind,
  StretchLog,
  StretchType,
  SummaryResponse,
  TrayStatus,
  UserSettings,
  UserSettingsUpdate,
  WaterReminderTriggerPayload
} from '../shared/types'

export interface PahingaPreloadApi {
  getAppInfo(): Promise<AppInfo>
  windowMinimize(): Promise<boolean>
  windowMaximize(): Promise<boolean>
  windowClose(): Promise<boolean>
  getSettings(): Promise<UserSettings>
  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings>
  resetSettingsToDefaults(): Promise<UserSettings>
  pickOverlayMedia(): Promise<string | null>
  isOnboardingComplete(): Promise<boolean>
  getNotificationStatus(): Promise<DesktopNotificationStatus>
  previewNotification(kind: NotificationPreviewKind): Promise<boolean>
  getTrayStatus(): Promise<TrayStatus>
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
  summaryGetToday(): Promise<SummaryResponse>
  summaryGetYesterday(): Promise<SummaryResponse>
  summaryGetLastSevenDays(): Promise<SummaryResponse>
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
