import { BrowserWindow } from 'electron'
import { WATER_REMINDER_EVENT } from '../../shared/ipc'
import type { WaterReminderTriggerPayload } from '../../shared/types'
import { nowIso } from '../database/timestamps'
import type { ReminderRepository } from '../repositories/reminderRepository'
import type { SettingsService } from './settingsService'
import type { FocusSessionService } from './focusSessionService'
import type { DesktopNotificationService } from './desktopNotificationService'

const TICK_MS = 12_000
const SNOOZE_MS = 5 * 60 * 1000

export const WATER_REMINDER_NOTIFICATION_BODY = 'Drink some water. Stay hydrated while working.'
export const WATER_REMINDER_MESSAGE = 'Time to hydrate. Your body needs water to stay focused.'

type Deps = {
  reminderRepo: ReminderRepository
  focusSessionService: FocusSessionService
  settingsService: SettingsService
  getMainWindow: () => BrowserWindow | null
  notificationService: DesktopNotificationService
}

export function createWaterReminderScheduler(deps: Deps): {
  start(): void
  stop(): void
  recordSnooze(): void
} {
  let timer: ReturnType<typeof setInterval> | null = null
  let lastBoundary = 0
  let lastSessionId: number | null = null
  let snoozeUntilMs = 0

  function sendToRenderer(payload: WaterReminderTriggerPayload): void {
    const win = deps.getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(WATER_REMINDER_EVENT, payload)
    }
  }

  function tick(): void {
    const settings = deps.settingsService.get()
    const intervalMin = settings.waterInterval
    if (!intervalMin || intervalMin <= 0) return

    const nowMs = Date.now()
    if (nowMs < snoozeUntilMs) return

    const ctx = deps.focusSessionService.getBreakReminderTickContext(nowMs)
    if (!ctx || ctx.paused) return

    if (lastSessionId !== ctx.sessionId) {
      lastSessionId = ctx.sessionId
      lastBoundary = 0
      snoozeUntilMs = 0
    }

    if (deps.reminderRepo.findPendingWaterReminder()) return

    const boundary = Math.floor(ctx.effectiveWorkMinutes / intervalMin)
    if (boundary < 1 || boundary <= lastBoundary) return

    const reminder = deps.reminderRepo.create({
      type: 'water',
      triggeredAt: nowIso(),
      status: 'pending'
    })

    const payload: WaterReminderTriggerPayload = {
      reminderId: reminder.id,
      message: WATER_REMINDER_MESSAGE
    }

    lastBoundary = boundary

    deps.notificationService.showWaterReminder(payload)
    sendToRenderer(payload)
  }

  return {
    start(): void {
      if (timer !== null) return
      timer = setInterval(tick, TICK_MS)
    },

    stop(): void {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
    },

    recordSnooze(): void {
      snoozeUntilMs = Date.now() + SNOOZE_MS
      lastBoundary = Math.max(0, lastBoundary - 1)
    }
  }
}

export type WaterReminderScheduler = ReturnType<typeof createWaterReminderScheduler>
