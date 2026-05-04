import { BrowserWindow, Notification } from 'electron'
import { BREAK_REMINDER_EVENT } from '../../shared/ipc'
import type { BreakOverlayTriggerPayload, BreakReminderTriggerPayload } from '../../shared/types'
import { nowIso } from '../database/timestamps'
import type { ReminderRepository } from '../repositories/reminderRepository'
import type { SettingsService } from './settingsService'
import type { FocusSessionService } from './focusSessionService'
import {
  BREAK_OVERLAY_MESSAGE,
  BREAK_REMINDER_NOTIFICATION_BODY,
  breakReminderModalFields
} from './breakReminderCopy'
import type { BreakOverlayService } from './breakOverlayService'
import { overlayMediaUrlFromPath } from './overlayMediaUrl'

const TICK_MS = 12_000
const SNOOZE_MS = 5 * 60 * 1000

type Deps = {
  reminderRepo: ReminderRepository
  focusSessionService: FocusSessionService
  settingsService: SettingsService
  getMainWindow: () => BrowserWindow | null
  breakOverlayService: BreakOverlayService
}

export function createBreakReminderScheduler(deps: Deps) {
  let timer: ReturnType<typeof setInterval> | null = null
  let lastBoundary = 0
  let lastSessionId: number | null = null
  let snoozeUntilMs = 0
  let lastTriggerPayload: BreakReminderTriggerPayload | null = null

  function sendToRenderer(payload: BreakReminderTriggerPayload): void {
    const win = deps.getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send(BREAK_REMINDER_EVENT, payload)
    }
  }

  function showNotification(): void {
    if (!Notification.isSupported()) return
    const settings = deps.settingsService.get()
    if (!settings.notificationsEnabled) return

    const n = new Notification({
      title: 'Pahinga',
      body: BREAK_REMINDER_NOTIFICATION_BODY
    })
    n.on('click', () => {
      const win = deps.getMainWindow()
      if (win && !win.isDestroyed()) {
        if (win.isMinimized()) win.restore()
        win.focus()
        if (lastTriggerPayload) {
          sendToRenderer(lastTriggerPayload)
        }
      }
    })
    n.show()
  }

  function tick(): void {
    const settings = deps.settingsService.get()
    const intervalMin = settings.breakInterval
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

    if (deps.reminderRepo.findPendingBreakReminder()) return

    const boundary = Math.floor(ctx.effectiveWorkMinutes / intervalMin)
    if (boundary < 1 || boundary <= lastBoundary) return

    const fields = breakReminderModalFields(settings)
    const reminder = deps.reminderRepo.create({
      type: 'break',
      triggeredAt: nowIso(),
      status: 'pending'
    })

    const payload: BreakReminderTriggerPayload = {
      reminderId: reminder.id,
      suggestedType: fields.suggestedType,
      durationMinutes: fields.durationMinutes,
      instruction: fields.instruction
    }
    lastTriggerPayload = payload
    lastBoundary = boundary

    showNotification()
    if (settings.restLockModeEnabled && settings.overlayMode !== 'soft_reminder') {
      const overlayPayload: BreakOverlayTriggerPayload = {
        reminderId: reminder.id,
        reason: 'break_reminder',
        durationMinutes: fields.durationMinutes,
        message: BREAK_OVERLAY_MESSAGE,
        instruction: fields.instruction,
        suggestedType: fields.suggestedType,
        mediaPath: overlayMediaUrlFromPath(settings.overlayMediaPath),
        allowEmergencyExit: settings.allowEmergencyExit,
        allowSnooze: settings.allowOverlaySnooze
      }
      deps.breakOverlayService.open(overlayPayload)
    } else {
      sendToRenderer(payload)
    }
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

    /** After snooze IPC: allow the same work boundary to fire again after 5 minutes (wall clock). */
    recordSnooze(): void {
      snoozeUntilMs = Date.now() + SNOOZE_MS
      lastBoundary = Math.max(0, lastBoundary - 1)
      lastTriggerPayload = null
    }
  }
}

export type BreakReminderScheduler = ReturnType<typeof createBreakReminderScheduler>
