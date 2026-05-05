import { app, BrowserWindow, dialog, ipcMain, type OpenDialogOptions } from 'electron'
import type Database from 'better-sqlite3'
import {
  APP_IPC_CHANNELS,
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
  WATER_REMINDER_IPC_CHANNELS
} from '../../shared/ipc'
import type {
  BreakOverlayTriggerPayload,
  BreakOverlayOpenReason,
  BreakReminderTriggerPayload,
  NotificationPreviewKind,
  StretchType
} from '../../shared/types'
import { createFocusSessionRepository } from '../repositories/focusSessionRepository'
import { createReminderRepository } from '../repositories/reminderRepository'
import { createStretchLogRepository } from '../repositories/stretchLogRepository'
import { createBreakReminderActions } from '../services/breakReminderActions'
import { createBreakOverlayService } from '../services/breakOverlayService'
import { createBreakReminderScheduler } from '../services/breakReminderScheduler'
import { createWaterReminderActions } from '../services/waterReminderActions'
import { createWaterReminderScheduler } from '../services/waterReminderScheduler'
import { createStretchService } from '../services/stretchService'
import { createSummaryService } from '../services/summaryService'
import {
  BREAK_OVERLAY_MESSAGE,
  BREAK_REMINDER_NOTIFICATION_BODY,
  breakReminderModalFields
} from '../services/breakReminderCopy'
import { getDefaultNekoUrls } from '../services/overlayMediaUrl'
import { createDashboardService } from '../services/dashboardService'
import { createFocusSessionService } from '../services/focusSessionService'
import { createSettingsService } from '../services/settingsService'
import { createDesktopNotificationService } from '../services/desktopNotificationService'
import { createTrayService } from '../services/trayService'
import { nowIso } from '../database/timestamps'
import { getAppInfo } from '../utils/appInfo'
import { normalizeIpcError } from './ipcError'

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

function sanitizeOverlayOpenReason(value: unknown): BreakOverlayOpenReason {
  if (value === 'focus_complete' || value === 'break_reminder') {
    return value
  }
  return 'focus_complete'
}

function sanitizeNotificationPreviewKind(value: unknown): NotificationPreviewKind {
  if (value === 'break' || value === 'water') return value
  throw new Error('Invalid notification preview type.')
}

export function registerPahingaIpc(
  db: Database.Database,
  getMainWindow: () => BrowserWindow | null,
  iconPath: string
): void {
  const settingsService = createSettingsService(db)
  const focusRepo = createFocusSessionRepository(db)
  const reminderRepo = createReminderRepository(db)
  const stretchRepo = createStretchLogRepository(db)

  const focusSessionService = createFocusSessionService(focusRepo, () => settingsService.get())
  const breakReminderActions = createBreakReminderActions(reminderRepo)
  const waterReminderActions = createWaterReminderActions(reminderRepo)
  const stretchService = createStretchService(stretchRepo)
  const summaryService = createSummaryService(focusRepo, reminderRepo, stretchRepo)
  const breakOverlayService = createBreakOverlayService({ getMainWindow })
  const notificationService = createDesktopNotificationService({
    getMainWindow,
    getSettings: () => settingsService.get()
  })

  // Sync startup login item with the stored preference on every app init.
  try {
    const currentSettings = settingsService.get()
    app.setLoginItemSettings({ openAtLogin: currentSettings.startupEnabled })
  } catch {
    // setLoginItemSettings may throw in dev/unsupported environments.
  }

  function openBreakOverlay(reason: BreakOverlayOpenReason): BreakOverlayTriggerPayload {
    const settings = settingsService.get()
    const fields = breakReminderModalFields(settings)
    const reminder = reminderRepo.create({
      type: 'break',
      triggeredAt: nowIso(),
      status: 'pending'
    })
    const payload: BreakOverlayTriggerPayload = {
      reminderId: reminder.id,
      reason,
      durationMinutes: fields.durationMinutes,
      message: BREAK_OVERLAY_MESSAGE,
      instruction: fields.instruction,
      suggestedType: fields.suggestedType,
      mediaPath: null,
      allowEmergencyExit: settings.allowEmergencyExit,
      allowSnooze: settings.allowOverlaySnooze,
      overlayMode: settings.overlayMode
    }

    const reminderPayload: BreakReminderTriggerPayload = {
      reminderId: reminder.id,
      suggestedType: fields.suggestedType,
      durationMinutes: fields.durationMinutes,
      instruction: fields.instruction
    }

    // Always send OS desktop notification (respects notificationsEnabled setting).
    notificationService.showBreakReminder(reminderPayload)

    if (settings.restLockModeEnabled && settings.overlayMode !== 'soft_reminder') {
      breakOverlayService.open(payload)
    } else {
      // Soft reminder or rest lock disabled: show the in-app modal instead.
      const win = getMainWindow()
      if (win && !win.isDestroyed()) {
        if (win.isMinimized()) win.restore()
        if (!win.isVisible()) win.show()
        win.focus()
        win.webContents.send(BREAK_REMINDER_EVENT, reminderPayload)
      }
    }

    return payload
  }

  const breakReminderScheduler = createBreakReminderScheduler({
    reminderRepo,
    focusSessionService,
    settingsService,
    getMainWindow,
    breakOverlayService,
    notificationService
  })
  breakReminderScheduler.start()

  const waterReminderScheduler = createWaterReminderScheduler({
    reminderRepo,
    focusSessionService,
    settingsService,
    getMainWindow,
    notificationService
  })
  waterReminderScheduler.start()

  const dashboardService = createDashboardService(
    settingsService,
    focusRepo,
    reminderRepo,
    stretchRepo,
    focusSessionService,
    () => {
      const settings = settingsService.get()
      if (settings.restLockModeEnabled && settings.overlayMode !== 'soft_reminder') {
        openBreakOverlay('focus_complete')
      }
    }
  )

  const trayService = createTrayService({
    iconPath,
    getMainWindow,
    startFocus: () => {
      try {
        focusSessionService.start()
      } catch {
        // If a focus session is already running, the tray action simply opens the app.
      }
    },
    takeBreak: () => {
      openBreakOverlay('break_reminder')
    }
  })
  trayService.create()

  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.GET)
  ipcMain.removeHandler(APP_IPC_CHANNELS.GET_INFO)
  ipcMain.removeHandler(WINDOW_IPC_CHANNELS.MINIMIZE)
  ipcMain.removeHandler(WINDOW_IPC_CHANNELS.MAXIMIZE)
  ipcMain.removeHandler(WINDOW_IPC_CHANNELS.CLOSE)
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
  ipcMain.removeHandler(WATER_REMINDER_IPC_CHANNELS.COMPLETE)
  ipcMain.removeHandler(WATER_REMINDER_IPC_CHANNELS.SNOOZE)
  ipcMain.removeHandler(WATER_REMINDER_IPC_CHANNELS.SKIP)
  ipcMain.removeHandler(STRETCH_IPC_CHANNELS.COMPLETE)
  ipcMain.removeHandler(STRETCH_IPC_CHANNELS.GET_TODAY)
  ipcMain.removeHandler(SUMMARY_IPC_CHANNELS.GET_TODAY)
  ipcMain.removeHandler(SUMMARY_IPC_CHANNELS.GET_YESTERDAY)
  ipcMain.removeHandler(SUMMARY_IPC_CHANNELS.GET_LAST_SEVEN_DAYS)
  ipcMain.removeHandler(OVERLAY_IPC_CHANNELS.OPEN_BREAK)
  ipcMain.removeHandler(OVERLAY_IPC_CHANNELS.CLOSE_BREAK)
  ipcMain.removeHandler(OVERLAY_IPC_CHANNELS.START_BREAK)
  ipcMain.removeHandler(OVERLAY_IPC_CHANNELS.SNOOZE_BREAK)
  ipcMain.removeHandler(OVERLAY_IPC_CHANNELS.EMERGENCY_EXIT)
  ipcMain.removeHandler(OVERLAY_IPC_CHANNELS.COMPLETE_BREAK)
  ipcMain.removeHandler(OVERLAY_IPC_CHANNELS.GET_BREAK_PAYLOAD)
  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.PICK_OVERLAY_MEDIA)
  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.RESET_TO_DEFAULTS)
  ipcMain.removeHandler(NOTIFICATION_IPC_CHANNELS.GET_STATUS)
  ipcMain.removeHandler(NOTIFICATION_IPC_CHANNELS.PREVIEW)
  ipcMain.removeHandler(TRAY_IPC_CHANNELS.GET_STATUS)

  function handleIpc<TArgs extends unknown[], TResult>(
    channel: string,
    handler: (...args: TArgs) => TResult
  ): void {
    ipcMain.handle(channel, (_event, ...args: TArgs) => {
      try {
        return handler(...args)
      } catch (error) {
        throw normalizeIpcError(channel, error)
      }
    })
  }

  handleIpc(APP_IPC_CHANNELS.GET_INFO, () => {
    return getAppInfo()
  })

  handleIpc(WINDOW_IPC_CHANNELS.MINIMIZE, () => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) win.minimize()
    return true
  })

  handleIpc(WINDOW_IPC_CHANNELS.MAXIMIZE, () => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) win.unmaximize()
      else win.maximize()
    }
    return true
  })

  handleIpc(WINDOW_IPC_CHANNELS.CLOSE, () => {
    const win = getMainWindow()
    if (win && !win.isDestroyed()) win.close()
    return true
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.GET, () => {
    return settingsService.get()
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.UPDATE, (_event, patch: unknown) => {
    const updated = settingsService.update(patch)
    if (app.isPackaged || process.platform !== 'linux') {
      try {
        app.setLoginItemSettings({ openAtLogin: updated.startupEnabled })
      } catch {
        // setLoginItemSettings is unsupported on some platforms — ignore silently.
      }
    }
    trayService.refreshMenu()
    return updated
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.RESET_TO_DEFAULTS, () => {
    const reset = settingsService.resetToDefaults()
    if (app.isPackaged || process.platform !== 'linux') {
      try {
        app.setLoginItemSettings({ openAtLogin: false })
      } catch {
        // ignore
      }
    }
    trayService.refreshMenu()
    return reset
  })

  ipcMain.handle(NOTIFICATION_IPC_CHANNELS.GET_STATUS, () => {
    return notificationService.getStatus()
  })

  ipcMain.handle(NOTIFICATION_IPC_CHANNELS.PREVIEW, (_event, raw: unknown) => {
    const kind = sanitizeNotificationPreviewKind(raw)

    if (kind === 'break') {
      const settings = settingsService.get()
      const fields = breakReminderModalFields(settings)
      return notificationService.showCustom('Pahinga', BREAK_REMINDER_NOTIFICATION_BODY, () => {
        const reminder = reminderRepo.create({
          type: 'break',
          triggeredAt: nowIso(),
          status: 'pending'
        })
        notificationService.openBreakReminder({
          reminderId: reminder.id,
          suggestedType: fields.suggestedType,
          durationMinutes: fields.durationMinutes,
          instruction: fields.instruction
        })
      })
    }

    return notificationService.showCustom(
      'Pahinga',
      'Drink some water. Stay hydrated while working.',
      () => {
        const reminder = reminderRepo.create({
          type: 'water',
          triggeredAt: nowIso(),
          status: 'pending'
        })
        notificationService.openWaterReminder({
          reminderId: reminder.id,
          message: 'Time to hydrate. Your body needs water to stay focused.'
        })
      }
    )
  })

  ipcMain.handle(TRAY_IPC_CHANNELS.GET_STATUS, () => {
    return trayService.getStatus()
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.IS_ONBOARDING_COMPLETE, () => {
    return settingsService.isOnboardingComplete()
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.PICK_OVERLAY_MEDIA, async () => {
    const opts: OpenDialogOptions = {
      title: 'Choose break overlay media',
      properties: ['openFile'],
      filters: [{ name: 'GIF or MP4', extensions: ['gif', 'mp4'] }]
    }
    const parent = getMainWindow()
    const result =
      parent && !parent.isDestroyed()
        ? await dialog.showOpenDialog(parent, opts)
        : await dialog.showOpenDialog(opts)
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
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
      const settings = settingsService.get()
      if (settings.restLockModeEnabled && settings.overlayMode !== 'soft_reminder') {
        openBreakOverlay('focus_complete')
      }
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

  ipcMain.handle(WATER_REMINDER_IPC_CHANNELS.COMPLETE, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    waterReminderActions.complete(id)
    return dashboardService.getToday()
  })

  ipcMain.handle(WATER_REMINDER_IPC_CHANNELS.SNOOZE, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    waterReminderActions.snooze(id)
    waterReminderScheduler.recordSnooze()
    return dashboardService.getToday()
  })

  ipcMain.handle(WATER_REMINDER_IPC_CHANNELS.SKIP, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    waterReminderActions.skip(id)
    return dashboardService.getToday()
  })

  ipcMain.handle(STRETCH_IPC_CHANNELS.COMPLETE, (_event, payload: unknown) => {
    if (!isPlainObject(payload)) throw new Error('Invalid stretch:complete payload.')
    const { stretchType, durationSeconds } = payload
    const validTypes: StretchType[] = ['neck', 'shoulder', 'wrist', 'eyes']
    if (typeof stretchType !== 'string' || !validTypes.includes(stretchType as StretchType)) {
      throw new Error('Invalid stretchType.')
    }
    if (
      typeof durationSeconds !== 'number' ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds < 0
    ) {
      throw new Error('Invalid durationSeconds.')
    }
    return stretchService.complete(stretchType as StretchType, Math.round(durationSeconds))
  })

  ipcMain.handle(STRETCH_IPC_CHANNELS.GET_TODAY, () => {
    return stretchService.getToday()
  })

  ipcMain.handle(SUMMARY_IPC_CHANNELS.GET_TODAY, () => {
    return summaryService.getToday()
  })

  ipcMain.handle(SUMMARY_IPC_CHANNELS.GET_YESTERDAY, () => {
    return summaryService.getYesterday()
  })

  ipcMain.handle(SUMMARY_IPC_CHANNELS.GET_LAST_SEVEN_DAYS, () => {
    return summaryService.getLastSevenDays()
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.OPEN_BREAK, (_event, rawReason: unknown) => {
    const reason = sanitizeOverlayOpenReason(rawReason)
    return openBreakOverlay(reason)
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.CLOSE_BREAK, () => {
    breakOverlayService.close()
    return true
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.GET_BREAK_PAYLOAD, () => {
    return breakOverlayService.getLastPayload()
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.START_BREAK, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    const r = reminderRepo.getById(id)
    if (!r || r.type !== 'break' || r.status !== 'pending') {
      throw new Error('Break reminder not found or already handled.')
    }
    return true
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.SNOOZE_BREAK, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    breakReminderActions.snooze(id)
    breakReminderScheduler.recordSnooze()
    breakOverlayService.close()
    return dashboardService.getToday()
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.EMERGENCY_EXIT, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    breakReminderActions.emergencyExit(id)
    breakOverlayService.close()
    return dashboardService.getToday()
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.COMPLETE_BREAK, (_event, raw: unknown) => {
    const id = sanitizeReminderId(raw)
    breakReminderActions.complete(id)
    // Keep overlay open after completion so user can choose next action manually.
    return dashboardService.getToday()
  })

  ipcMain.handle(OVERLAY_IPC_CHANNELS.GET_NEKO_URLS, () => {
    return getDefaultNekoUrls(app.getAppPath())
  })
}
