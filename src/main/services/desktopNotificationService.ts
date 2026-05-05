import { BrowserWindow, Notification } from 'electron'
import { BREAK_REMINDER_EVENT, WATER_REMINDER_EVENT } from '../../shared/ipc'
import type {
  BreakReminderTriggerPayload,
  DesktopNotificationStatus,
  UserSettings,
  WaterReminderTriggerPayload
} from '../../shared/types'
import { BREAK_REMINDER_NOTIFICATION_BODY } from './breakReminderCopy'
import { WATER_REMINDER_NOTIFICATION_BODY } from './waterReminderScheduler'

type Deps = {
  getMainWindow: () => BrowserWindow | null
  getSettings: () => UserSettings
}

function restoreWindow(win: BrowserWindow): void {
  if (win.isDestroyed()) return
  if (!win.isVisible()) win.show()
  if (win.isMinimized()) win.restore()
  win.focus()
}

export function createDesktopNotificationService(deps: Deps): {
  getStatus(): DesktopNotificationStatus
  openBreakReminder(payload: BreakReminderTriggerPayload): void
  openWaterReminder(payload: WaterReminderTriggerPayload): void
  showCustom(title: string, body: string, onClick: () => void): boolean
  showBreakReminder(payload: BreakReminderTriggerPayload): boolean
  showWaterReminder(payload: WaterReminderTriggerPayload): boolean
} {
  function getStatus(): DesktopNotificationStatus {
    const supported = Notification.isSupported()
    const enabledInSettings = deps.getSettings().notificationsEnabled
    const permissionStatus = !supported
      ? 'unsupported'
      : enabledInSettings
        ? 'ready'
        : 'disabled_in_settings'

    const message =
      permissionStatus === 'ready'
        ? 'Desktop notifications are ready.'
        : permissionStatus === 'disabled_in_settings'
          ? 'Desktop notifications are turned off in Settings.'
          : 'Desktop notifications are not supported in this environment.'

    return {
      supported,
      enabledInSettings,
      permissionStatus,
      message
    }
  }

  function sendToMainWindow(channel: string, payload: unknown): void {
    const win = deps.getMainWindow()
    if (!win || win.isDestroyed()) return
    restoreWindow(win)
    win.webContents.send(channel, payload)
  }

  function show(title: string, body: string, onClick: () => void): boolean {
    const status = getStatus()
    if (status.permissionStatus !== 'ready') return false

    const notification = new Notification({ title, body })
    notification.on('click', onClick)
    notification.show()
    return true
  }

  return {
    getStatus,

    openBreakReminder(payload: BreakReminderTriggerPayload): void {
      sendToMainWindow(BREAK_REMINDER_EVENT, payload)
    },

    openWaterReminder(payload: WaterReminderTriggerPayload): void {
      sendToMainWindow(WATER_REMINDER_EVENT, payload)
    },

    showCustom(title: string, body: string, onClick: () => void): boolean {
      return show(title, body, onClick)
    },

    showBreakReminder(payload: BreakReminderTriggerPayload): boolean {
      return show('Pahinga', BREAK_REMINDER_NOTIFICATION_BODY, () => {
        sendToMainWindow(BREAK_REMINDER_EVENT, payload)
      })
    },

    showWaterReminder(payload: WaterReminderTriggerPayload): boolean {
      return show('Pahinga', WATER_REMINDER_NOTIFICATION_BODY, () => {
        sendToMainWindow(WATER_REMINDER_EVENT, payload)
      })
    }
  }
}

export type DesktopNotificationService = ReturnType<typeof createDesktopNotificationService>
