import { BrowserWindow, ipcMain } from 'electron'
import type Database from 'better-sqlite3'
import {
  DASHBOARD_IPC_CHANNELS,
  REMINDER_IPC_CHANNELS,
  SESSION_IPC_CHANNELS,
  SETTINGS_IPC_CHANNELS
} from '../../shared/ipc'
import { createFocusSessionRepository } from '../repositories/focusSessionRepository'
import { createReminderRepository } from '../repositories/reminderRepository'
import { createStretchLogRepository } from '../repositories/stretchLogRepository'
import { createBreakReminderActions } from '../services/breakReminderActions'
import { createBreakReminderScheduler } from '../services/breakReminderScheduler'
import { createDashboardService } from '../services/dashboardService'
import { createFocusSessionService } from '../services/focusSessionService'
import { createSettingsService } from '../services/settingsService'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeReminderId(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 1) {
    throw new Error('Invalid reminder id.')
  }
  return raw
}

function sanitizeSessionStartPayload(payload: unknown): { plannedMinutes?: number } | undefined {
  if (payload === undefined) return undefined
  if (!isPlainObject(payload)) {
    throw new Error('Invalid session:start payload')
  }
  if (!('plannedMinutes' in payload)) return undefined
  const v = payload.plannedMinutes
  if (v === undefined) return undefined
  if (typeof v !== 'number' || !Number.isInteger(v)) {
    throw new Error('plannedMinutes must be an integer')
  }
  if (v < 1 || v > 180) {
    throw new Error('Focus duration must be between 1 and 180 minutes.')
  }
  return { plannedMinutes: v }
}

export function registerPahingaIpc(
  db: Database.Database,
  getMainWindow: () => BrowserWindow | null
): void {
  const settingsService = createSettingsService(db)
  const focusRepo = createFocusSessionRepository(db)
  const reminderRepo = createReminderRepository(db)
  const stretchRepo = createStretchLogRepository(db)

  const focusSessionService = createFocusSessionService(focusRepo, () => settingsService.get())
  const breakReminderActions = createBreakReminderActions(reminderRepo)
  const breakReminderScheduler = createBreakReminderScheduler({
    reminderRepo,
    focusSessionService,
    settingsService,
    getMainWindow
  })
  breakReminderScheduler.start()

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
  ipcMain.removeHandler(SESSION_IPC_CHANNELS.CANCEL)
  ipcMain.removeHandler(SESSION_IPC_CHANNELS.SKIP)
  ipcMain.removeHandler(REMINDER_IPC_CHANNELS.COMPLETE)
  ipcMain.removeHandler(REMINDER_IPC_CHANNELS.SNOOZE)
  ipcMain.removeHandler(REMINDER_IPC_CHANNELS.SKIP)

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

  ipcMain.handle(SESSION_IPC_CHANNELS.START, (_event, payload: unknown) => {
    const opts = sanitizeSessionStartPayload(payload)
    focusSessionService.start(opts)
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
    // Legacy preload called `session:end` with `{ completed: false }` to cancel before `session:cancel` existed.
    if (isPlainObject(payload) && payload.completed === false) {
      focusSessionService.cancel()
    } else {
      focusSessionService.complete()
    }
    return dashboardService.getToday()
  })

  ipcMain.handle(SESSION_IPC_CHANNELS.CANCEL, () => {
    focusSessionService.cancel()
    return dashboardService.getToday()
  })

  ipcMain.handle(SESSION_IPC_CHANNELS.SKIP, () => {
    focusSessionService.skip()
    return dashboardService.getToday()
  })

  ipcMain.handle(REMINDER_IPC_CHANNELS.COMPLETE, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    breakReminderActions.complete(id)
    return dashboardService.getToday()
  })

  ipcMain.handle(REMINDER_IPC_CHANNELS.SNOOZE, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    breakReminderActions.snooze(id)
    breakReminderScheduler.recordSnooze()
    return dashboardService.getToday()
  })

  ipcMain.handle(REMINDER_IPC_CHANNELS.SKIP, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    breakReminderActions.skip(id)
    return dashboardService.getToday()
  })
}
