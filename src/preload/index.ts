import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  DASHBOARD_IPC_CHANNELS,
  SESSION_IPC_CHANNELS,
  SETTINGS_IPC_CHANNELS
} from '../shared/ipc'
import type { DashboardToday, UserSettings, UserSettingsUpdate } from '../shared/types'

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
  sessionStart(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.START)
  },
  sessionPause(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.PAUSE)
  },
  sessionResume(): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.RESUME)
  },
  sessionEnd(completed: boolean): Promise<DashboardToday> {
    return ipcRenderer.invoke(SESSION_IPC_CHANNELS.END, { completed })
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
