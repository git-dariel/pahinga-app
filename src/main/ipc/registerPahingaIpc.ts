import { ipcMain } from 'electron'
import type Database from 'better-sqlite3'
import {
  DASHBOARD_IPC_CHANNELS,
  SESSION_IPC_CHANNELS,
  SETTINGS_IPC_CHANNELS
} from '../../shared/ipc'
import { createFocusSessionRepository } from '../repositories/focusSessionRepository'
import { createReminderRepository } from '../repositories/reminderRepository'
import { createStretchLogRepository } from '../repositories/stretchLogRepository'
import { createDashboardService } from '../services/dashboardService'
import { createFocusSessionService } from '../services/focusSessionService'
import { createSettingsService } from '../services/settingsService'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function registerPahingaIpc(db: Database.Database): void {
  const settingsService = createSettingsService(db)
  const focusRepo = createFocusSessionRepository(db)
  const reminderRepo = createReminderRepository(db)
  const stretchRepo = createStretchLogRepository(db)

  const focusSessionService = createFocusSessionService(focusRepo, () => settingsService.get())
  const dashboardService = createDashboardService(
    settingsService,
    focusRepo,
    reminderRepo,
    stretchRepo,
    focusSessionService
  )

  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.GET)
  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.UPDATE)
  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.IS_ONBOARDING_COMPLETE)
  ipcMain.removeHandler(DASHBOARD_IPC_CHANNELS.GET_TODAY)
  ipcMain.removeHandler(SESSION_IPC_CHANNELS.START)
  ipcMain.removeHandler(SESSION_IPC_CHANNELS.PAUSE)
  ipcMain.removeHandler(SESSION_IPC_CHANNELS.RESUME)
  ipcMain.removeHandler(SESSION_IPC_CHANNELS.END)

  ipcMain.handle(SETTINGS_IPC_CHANNELS.GET, () => {
    return settingsService.get()
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.UPDATE, (_event, patch: unknown) => {
    return settingsService.update(patch)
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.IS_ONBOARDING_COMPLETE, () => {
    return settingsService.isOnboardingComplete()
  })

  ipcMain.handle(DASHBOARD_IPC_CHANNELS.GET_TODAY, () => {
    return dashboardService.getToday()
  })

  ipcMain.handle(SESSION_IPC_CHANNELS.START, () => {
    focusSessionService.start()
    return dashboardService.getToday()
  })

  ipcMain.handle(SESSION_IPC_CHANNELS.PAUSE, () => {
    focusSessionService.pause()
    return dashboardService.getToday()
  })

  ipcMain.handle(SESSION_IPC_CHANNELS.RESUME, () => {
    focusSessionService.resume()
    return dashboardService.getToday()
  })

  ipcMain.handle(SESSION_IPC_CHANNELS.END, (_event, payload: unknown) => {
    if (!isPlainObject(payload) || typeof payload.completed !== 'boolean') {
      throw new Error('Invalid session:end payload')
    }
    focusSessionService.end(payload.completed)
    return dashboardService.getToday()
  })
}
