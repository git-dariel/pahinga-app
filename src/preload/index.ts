import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  APP_IPC_CHANNELS,
  BREAK_OVERLAY_EVENT,
  BREAK_REMINDER_EVENT,
  DASHBOARD_IPC_CHANNELS,
  NOTIFICATION_IPC_CHANNELS,
  OVERLAY_IPC_CHANNELS,
  REMINDER_IPC_CHANNELS,
  SESSION_IPC_CHANNELS,
  SETTINGS_IPC_CHANNELS,
  STRETCH_IPC_CHANNELS,
  SUMMARY_IPC_CHANNELS,
  TRAY_IPC_CHANNELS,
  WINDOW_IPC_CHANNELS,
  WATER_REMINDER_EVENT,
  WATER_REMINDER_IPC_CHANNELS
} from '../shared/ipc'
import type {
  BreakOverlayOpenReason,
  BreakOverlayTriggerPayload,
  BreakReminderTriggerPayload,
  AppInfo,
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

const pahinga = {
  getSettings(): Promise<UserSettings> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.GET)
  },
  getAppInfo(): Promise<AppInfo> {
    return ipcRenderer.invoke(APP_IPC_CHANNELS.GET_INFO)
  },
  windowMinimize(): Promise<boolean> {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.MINIMIZE)
  },
  windowMaximize(): Promise<boolean> {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.MAXIMIZE)
  },
  windowClose(): Promise<boolean> {
    return ipcRenderer.invoke(WINDOW_IPC_CHANNELS.CLOSE)
  },
  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.UPDATE, patch)
  },

  resetSettingsToDefaults(): Promise<UserSettings> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.RESET_TO_DEFAULTS)
  },

  pickOverlayMedia(): Promise<string | null> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.PICK_OVERLAY_MEDIA)
  },
  isOnboardingComplete(): Promise<boolean> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.IS_ONBOARDING_COMPLETE)
  },
  getNotificationStatus(): Promise<DesktopNotificationStatus> {
    return ipcRenderer.invoke(NOTIFICATION_IPC_CHANNELS.GET_STATUS)
  },
  previewNotification(kind: NotificationPreviewKind): Promise<boolean> {
    return ipcRenderer.invoke(NOTIFICATION_IPC_CHANNELS.PREVIEW, kind)
  },
  getTrayStatus(): Promise<TrayStatus> {
    return ipcRenderer.invoke(TRAY_IPC_CHANNELS.GET_STATUS)
  },
  getDashboardToday(): Promise<DashboardToday> {
    return ipcRenderer.invoke(DASHBOARD_IPC_CHANNELS.GET_TODAY)
  },
  sessionStart(payload?: { plannedMinutes?: number }): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.START, payload)
  },
  sessionPause(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.PAUSE)
  },
  sessionResume(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.RESUME)
  },
  sessionEnd(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.END)
  },
  sessionCancel(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.CANCEL)
  },
  sessionSkip(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.SKIP)
  },

  reminderComplete(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(REMINDER_IPC_CHANNELS.COMPLETE, reminderId)
  },

  reminderSnooze(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(REMINDER_IPC_CHANNELS.SNOOZE, reminderId)
  },

  reminderSkip(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(REMINDER_IPC_CHANNELS.SKIP, reminderId)
  },

  onBreakReminderTrigger(callback: (payload: BreakReminderTriggerPayload) => void): () => void {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: BreakReminderTriggerPayload
    ): void => {
      callback(payload)
    }
    ipcRenderer.on(BREAK_REMINDER_EVENT, handler)
    return () => {
      ipcRenderer.removeListener(BREAK_REMINDER_EVENT, handler)
    }
  },

  waterReminderComplete(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(WATER_REMINDER_IPC_CHANNELS.COMPLETE, reminderId)
  },

  waterReminderSnooze(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(WATER_REMINDER_IPC_CHANNELS.SNOOZE, reminderId)
  },

  waterReminderSkip(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(WATER_REMINDER_IPC_CHANNELS.SKIP, reminderId)
  },

  onWaterReminderTrigger(callback: (payload: WaterReminderTriggerPayload) => void): () => void {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: WaterReminderTriggerPayload
    ): void => {
      callback(payload)
    }
    ipcRenderer.on(WATER_REMINDER_EVENT, handler)
    return () => {
      ipcRenderer.removeListener(WATER_REMINDER_EVENT, handler)
    }
  },

  stretchComplete(stretchType: StretchType, durationSeconds: number): Promise<StretchLog> {
    return ipcRenderer.invoke(STRETCH_IPC_CHANNELS.COMPLETE, { stretchType, durationSeconds })
  },

  stretchGetToday(): Promise<StretchLog[]> {
    return ipcRenderer.invoke(STRETCH_IPC_CHANNELS.GET_TODAY)
  },

  summaryGetToday(): Promise<SummaryResponse> {
    return ipcRenderer.invoke(SUMMARY_IPC_CHANNELS.GET_TODAY)
  },

  summaryGetYesterday(): Promise<SummaryResponse> {
    return ipcRenderer.invoke(SUMMARY_IPC_CHANNELS.GET_YESTERDAY)
  },

  summaryGetLastSevenDays(): Promise<SummaryResponse> {
    return ipcRenderer.invoke(SUMMARY_IPC_CHANNELS.GET_LAST_SEVEN_DAYS)
  },

  overlayOpenBreak(reason: BreakOverlayOpenReason): Promise<BreakOverlayTriggerPayload> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.OPEN_BREAK, reason)
  },

  overlayCloseBreak(): Promise<boolean> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.CLOSE_BREAK)
  },

  overlayStartBreak(reminderId: number): Promise<boolean> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.START_BREAK, reminderId)
  },

  overlaySnoozeBreak(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.SNOOZE_BREAK, reminderId)
  },

  overlayEmergencyExit(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.EMERGENCY_EXIT, reminderId)
  },

  overlayCompleteBreak(reminderId: number): Promise<DashboardToday> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.COMPLETE_BREAK, reminderId)
  },

  onOverlayBreakTriggered(callback: (payload: BreakOverlayTriggerPayload) => void): () => void {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: BreakOverlayTriggerPayload
    ): void => {
      callback(payload)
    }
    ipcRenderer.on(BREAK_OVERLAY_EVENT, handler)
    return () => {
      ipcRenderer.removeListener(BREAK_OVERLAY_EVENT, handler)
    }
  },

  getBreakOverlayPayload(): Promise<BreakOverlayTriggerPayload | null> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.GET_BREAK_PAYLOAD)
  },

  getNekoUrls(): Promise<{ intro: string; loop: string }> {
    return ipcRenderer.invoke(OVERLAY_IPC_CHANNELS.GET_NEKO_URLS)
  }
}

const api = { pahinga }

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error Dev-only bridge when `contextIsolation` is disabled
  window.electron = electronAPI
  // @ts-expect-error Dev-only bridge when `contextIsolation` is disabled
  window.api = api
}
