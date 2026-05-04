import type { FocusSession, UserSettings } from '../../shared/types'
import { nowIso } from '../database/timestamps'
import type { FocusSessionRepository } from '../repositories/focusSessionRepository'

const MIN_FOCUS_MINUTES = 1
const MAX_FOCUS_MINUTES = 180

type Live = {
  sessionId: number
  paused: boolean
  pauseStartedAtMs: number | null
  accumulatedPauseMs: number
}

function effectivePauseMs(live: Live, nowMs: number): number {
  let p = live.accumulatedPauseMs
  if (live.paused && live.pauseStartedAtMs !== null) {
    p += nowMs - live.pauseStartedAtMs
  }
  return p
}

function minutesUntilNextBoundary(elapsedWorkMinutes: number, intervalMinutes: number): number {
  if (intervalMinutes <= 0) return 0
  if (elapsedWorkMinutes <= 0) return intervalMinutes
  const next = Math.ceil(elapsedWorkMinutes / intervalMinutes) * intervalMinutes
  return Math.max(0, Math.round(next - elapsedWorkMinutes))
}

export function createFocusSessionService(
  focusRepo: FocusSessionRepository,
  getSettings: () => UserSettings
) {
  let live: Live | null = null

  function getTargetMinutes(session: FocusSession): number {
    const settings = getSettings()
    return session.targetMinutes ?? settings.focusDuration
  }

  function syncLiveWithDb(): FocusSession | null {
    const active = focusRepo.findActive()
    if (!active) {
      live = null
      return null
    }
    if (!live || live.sessionId !== active.id) {
      live = {
        sessionId: active.id,
        paused: false,
        pauseStartedAtMs: null,
        accumulatedPauseMs: 0
      }
    }
    return active
  }

  function getFocusRemainingSeconds(session: FocusSession, nowMs: number): number {
    if (!live || live.sessionId !== session.id) {
      syncLiveWithDb()
    }
    if (!live) return 0
    const targetSec = getTargetMinutes(session) * 60
    const started = Date.parse(session.startedAt)
    const elapsed = nowMs - started
    const effectiveWorkMs = Math.max(0, elapsed - effectivePauseMs(live, nowMs))
    return Math.max(0, Math.floor(targetSec - effectiveWorkMs / 1000))
  }

  function getEffectiveWorkMinutes(session: FocusSession, nowMs: number): number {
    if (!live || live.sessionId !== session.id) {
      syncLiveWithDb()
    }
    if (!live) return 0
    const started = Date.parse(session.startedAt)
    const elapsed = nowMs - started
    const effectiveWorkMs = Math.max(0, elapsed - effectivePauseMs(live, nowMs))
    return effectiveWorkMs / 60000
  }

  function finalizeCompleted(session: FocusSession): void {
    const target = getTargetMinutes(session)
    focusRepo.updateById(session.id, {
      endedAt: nowIso(),
      durationMinutes: target,
      status: 'completed'
    })
    live = null
  }

  function finalizeEarlyExit(status: 'cancelled' | 'skipped'): void {
    const session = syncLiveWithDb()
    if (!session || !live) throw new Error('No active focus session.')
    const nowMs = Date.now()
    const effectiveMs = Math.max(0, nowMs - Date.parse(session.startedAt) - effectivePauseMs(live, nowMs))
    const durationMinutes = Math.max(1, Math.round(effectiveMs / 60000))
    focusRepo.updateById(session.id, {
      endedAt: nowIso(),
      durationMinutes,
      status
    })
    live = null
  }

  return {
    syncLiveWithDb,

    start(options?: { plannedMinutes?: number }): FocusSession {
      if (focusRepo.findActive()) {
        throw new Error('A focus session is already running.')
      }
      const settings = getSettings()
      const target =
        options?.plannedMinutes !== undefined ? options.plannedMinutes : settings.focusDuration
      if (
        typeof target !== 'number' ||
        !Number.isInteger(target) ||
        target < MIN_FOCUS_MINUTES ||
        target > MAX_FOCUS_MINUTES
      ) {
        throw new Error(`Focus duration must be an integer between ${MIN_FOCUS_MINUTES} and ${MAX_FOCUS_MINUTES} minutes.`)
      }

      const session = focusRepo.create({
        targetMinutes: target
      })
      live = {
        sessionId: session.id,
        paused: false,
        pauseStartedAtMs: null,
        accumulatedPauseMs: 0
      }
      return session
    },

    pause(): FocusSession {
      const session = syncLiveWithDb()
      if (!session || !live) throw new Error('No active focus session.')
      if (live.paused) return session
      live.paused = true
      live.pauseStartedAtMs = Date.now()
      return session
    },

    resume(): FocusSession {
      const session = syncLiveWithDb()
      if (!session || !live) throw new Error('No active focus session.')
      if (!live.paused) return session
      if (live.pauseStartedAtMs !== null) {
        live.accumulatedPauseMs += Date.now() - live.pauseStartedAtMs
      }
      live.paused = false
      live.pauseStartedAtMs = null
      return session
    },

    /** Mark session completed (timer done or explicit). Idempotent if already idle. */
    complete(): void {
      const session = syncLiveWithDb()
      if (!session || !live) return
      finalizeCompleted(session)
    },

    /** User ends the session early (cancelled). */
    cancel(): void {
      finalizeEarlyExit('cancelled')
    },

    /** Early exit recorded as skipped (for analytics / future flows). */
    skip(): void {
      finalizeEarlyExit('skipped')
    },

    /** Completes the session when the focus timer reaches zero (still focusing). */
    completeDueToTimer(): void {
      const session = syncLiveWithDb()
      if (!session || !live || live.paused) return
      const nowMs = Date.now()
      if (getFocusRemainingSeconds(session, nowMs) > 0) return
      finalizeCompleted(session)
    },

    /**
     * Active focus session only: effective work minutes and pause state for break reminder scheduling.
     */
    getBreakReminderTickContext(nowMs: number): {
      sessionId: number
      effectiveWorkMinutes: number
      paused: boolean
    } | null {
      const session = syncLiveWithDb()
      if (!session || !live) return null
      return {
        sessionId: session.id,
        effectiveWorkMinutes: getEffectiveWorkMinutes(session, nowMs),
        paused: live.paused
      }
    },

    getMetrics(
      session: FocusSession,
      nowMs: number,
      settings: UserSettings
    ): {
      remainingSec: number
      nextBreakInMinutes: number
      nextWaterInMinutes: number
      paused: boolean
    } {
      syncLiveWithDb()
      const paused = live !== null && live.sessionId === session.id && live.paused
      const remainingSec = getFocusRemainingSeconds(session, nowMs)
      const workMin = getEffectiveWorkMinutes(session, nowMs)
      return {
        remainingSec,
        nextBreakInMinutes: minutesUntilNextBoundary(workMin, settings.breakInterval),
        nextWaterInMinutes: minutesUntilNextBoundary(workMin, settings.waterInterval),
        paused: !!paused
      }
    }
  }
}

export type FocusSessionService = ReturnType<typeof createFocusSessionService>
