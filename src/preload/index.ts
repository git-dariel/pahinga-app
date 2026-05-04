import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  BREAK_REMINDER_EVENT,
  DASHBOARD_IPC_CHANNELS,
  REMINDER_IPC_CHANNELS,
  SESSION_IPC_CHANNELS,
  SETTINGS_IPC_CHANNELS
} from '../shared/ipc'
import type {
  BreakReminderTriggerPayload,
  DashboardToday,
  UserSettings,
  UserSettingsUpdate
} from '../shared/types'

const pahinga = {
  getSettings(): Promise<UserSettings> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.GET)
  },
  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.UPDATE, patch)
  },
  isOnboardingComplete(): Promise<boolean> {
    return ipcRenderer.invoke(SETTINGS_IPC_CHANNELS.IS_ONBOARDING_COMPLETE)
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
    const handler = (_event: Electron.IpcRendererEvent, payload: BreakReminderTriggerPayload): void => {
      callback(payload)
    }
    ipcRenderer.on(BREAK_REMINDER_EVENT, handler)
    return () => {
      ipcRenderer.removeListener(BREAK_REMINDER_EVENT, handler)
    }
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
