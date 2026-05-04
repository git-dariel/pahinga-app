import type { FocusSession, UserSettings } from '../../shared/types'
import { nowIso } from '../database/timestamps'
import type { FocusSessionRepository } from '../repositories/focusSessionRepository'

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
    const settings = getSettings()
    const targetSec = settings.focusDuration * 60
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

  return {
    syncLiveWithDb,

    start(): FocusSession {
      if (focusRepo.findActive()) {
        throw new Error('A focus session is already running.')
      }
      const session = focusRepo.create({})
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

    end(completed: boolean): void {
      const session = syncLiveWithDb()
      if (!session || !live) throw new Error('No active focus session.')
      const nowMs = Date.now()
      const settings = getSettings()
      const effectiveMs = Math.max(0, nowMs - Date.parse(session.startedAt) - effectivePauseMs(live, nowMs))
      const durationMinutes = Math.max(1, Math.round(effectiveMs / 60000))

      if (completed) {
        focusRepo.updateById(session.id, {
          endedAt: nowIso(),
          durationMinutes: settings.focusDuration,
          status: 'completed'
        })
      } else {
        focusRepo.updateById(session.id, {
          endedAt: nowIso(),
          durationMinutes: durationMinutes,
          status: 'cancelled'
        })
      }
      live = null
    },

    /** Completes the session when the focus timer reaches zero (still focusing). */
    completeDueToTimer(): void {
      const session = syncLiveWithDb()
      if (!session || !live || live.paused) return
      const nowMs = Date.now()
      if (getFocusRemainingSeconds(session, nowMs) > 0) return
      const settings = getSettings()
      focusRepo.updateById(session.id, {
        endedAt: nowIso(),
        durationMinutes: settings.focusDuration,
        status: 'completed'
      })
      live = null
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
