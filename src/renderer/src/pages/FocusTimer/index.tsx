import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pause, Play, Square } from 'lucide-react'
import { FOCUS_DURATION_OPTIONS } from '@shared/reminderIntervals'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { formatClock } from '@renderer/lib/formatClock'
import { ensureNotificationPermission, notifyFocusSessionComplete } from '@renderer/lib/focusNotifications'
import { useDashboard } from '@renderer/hooks/useDashboard'

const MIN_CUSTOM = 1
const MAX_CUSTOM = 180

export default function FocusTimer(): React.ReactNode {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data, status, error, refresh, startSession, pauseSession, resumeSession, stopSession } =
    useDashboard()

  const [plannedMinutes, setPlannedMinutes] = useState(25)
  const [customOpen, setCustomOpen] = useState(false)
  const [customRaw, setCustomRaw] = useState('')
  const [showComplete, setShowComplete] = useState(false)

  const userCancelledRef = useRef(false)
  const hadActiveRef = useRef(false)
  const minutesInitialized = useRef(false)

  useEffect(() => {
    if (!data || minutesInitialized.current) return
    setPlannedMinutes(data.settings.focusDuration)
    minutesInitialized.current = true
  }, [data])

  const idle = data?.sessionPhase === 'idle'
  const focusing = data?.sessionPhase === 'focusing'
  const paused = data?.sessionPhase === 'paused'
  const active = !!data?.activeSession && (focusing || paused)

  const targetMinutes =
    data?.activeSession?.targetMinutes ?? data?.settings.focusDuration ?? plannedMinutes

  useEffect(() => {
    if (!data) return

    if (active) {
      hadActiveRef.current = true
      userCancelledRef.current = false
      setShowComplete(false)
      return
    }

    if (hadActiveRef.current && !userCancelledRef.current) {
      setShowComplete(true)
      notifyFocusSessionComplete(data.settings)
    }

    hadActiveRef.current = false
  }, [data, active])

  async function onStart(): Promise<void> {
    let minutes = plannedMinutes
    if (customOpen) {
      const n = Number.parseInt(customRaw, 10)
      if (!Number.isFinite(n) || n < MIN_CUSTOM || n > MAX_CUSTOM) {
        showToast(`Enter a whole number between ${MIN_CUSTOM} and ${MAX_CUSTOM} minutes.`, 'error')
        return
      }
      minutes = n
      setPlannedMinutes(n)
    }

    try {
      if (data?.settings.notificationsEnabled) {
        void ensureNotificationPermission()
      }
      await startSession(minutes)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not start session.', 'error')
    }
  }

  async function onPause(): Promise<void> {
    try {
      await pauseSession()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not pause.', 'error')
    }
  }

  async function onResume(): Promise<void> {
    try {
      await resumeSession()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not resume.', 'error')
    }
  }

  const onEndSession = useCallback(async () => {
    userCancelledRef.current = true
    try {
      await stopSession()
      showToast('Session ended.', 'info')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not end session.', 'error')
    }
  }, [stopSession, showToast])

  function onSkipBreak(): void {
    setShowComplete(false)
  }

  function onStartAnother(): void {
    setShowComplete(false)
    if (data) setPlannedMinutes(data.settings.focusDuration)
  }

  function onStartFiveBreak(): void {
    setShowComplete(false)
    navigate('/stretch')
  }

  if (status === 'loading' && !data) {
    return (
      <div className="p-8 max-w-lg">
        <div className="h-8 w-56 rounded-lg bg-border animate-pulse mb-2" />
        <div className="h-64 rounded-xl bg-border animate-pulse mt-6" />
      </div>
    )
  }

  if (status === 'error' && !data) {
    return (
      <div className="p-8 max-w-lg">
        <h1 className="text-2xl font-bold text-foreground">Focus Timer</h1>
        <p className="mt-4 text-sm text-danger">{error?.message ?? 'Failed to load.'}</p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  const sessionLabel = paused ? 'Paused' : focusing ? 'Focus session' : 'Ready'
  const remaining = data.focusRemainingSeconds

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Focus Timer</h1>
          <p className="text-sm text-muted mt-1">Work in focused sessions with intentional breaks.</p>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 shrink-0">
          Dashboard
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-warning/40 bg-surface px-4 py-3 text-sm text-warning">
          {error.message}
        </div>
      ) : null}

      <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-stretch gap-8 relative overflow-hidden">
        {showComplete ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/95 px-6 text-center">
            <p className="text-lg font-semibold text-foreground">Focus session complete</p>
            <p className="text-sm text-muted mt-2 max-w-xs">
              Take a short break. What would you like to do next?
            </p>
            <div className="mt-6 flex flex-col w-full max-w-xs gap-2">
              <button
                type="button"
                onClick={onStartFiveBreak}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
              >
                Start 5-minute break
              </button>
              <button
                type="button"
                onClick={onSkipBreak}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background"
              >
                Skip break
              </button>
              <button
                type="button"
                onClick={onStartAnother}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background"
              >
                Start another focus session
              </button>
            </div>
          </div>
        ) : null}

        <div className="text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">{sessionLabel}</p>
          <p
            className="text-6xl sm:text-7xl font-bold text-foreground tabular-nums tracking-tight"
            aria-live="polite"
          >
            {idle ? formatClock(plannedMinutes * 60) : formatClock(remaining)}
          </p>
          {!idle ? (
            <p className="text-xs text-muted mt-3">
              {targetMinutes} min block · Your next break will start after this session.
            </p>
          ) : (
            <p className="text-xs text-muted mt-3">Your next break will start after this session.</p>
          )}
        </div>

        {idle ? (
          <>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Duration</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_DURATION_OPTIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => {
                      setPlannedMinutes(min)
                      setCustomOpen(false)
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      plannedMinutes === min && !customOpen
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border text-muted hover:text-foreground hover:border-primary/50'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomOpen(true)
                    setCustomRaw(String(plannedMinutes))
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    customOpen
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border text-muted hover:text-foreground hover:border-primary/50'
                  }`}
                >
                  Custom
                </button>
              </div>
              {customOpen ? (
                <div className="mt-4 flex items-center gap-2">
                  <label htmlFor="focus-custom-min" className="text-sm text-muted">
                    Minutes
                  </label>
                  <input
                    id="focus-custom-min"
                    type="number"
                    min={MIN_CUSTOM}
                    max={MAX_CUSTOM}
                    value={customRaw}
                    onChange={(e) => setCustomRaw(e.target.value)}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => void onStart()}
              className="w-full px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Start Focus
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {focusing ? (
              <button
                type="button"
                onClick={() => void onPause()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background"
              >
                <Pause className="h-4 w-4" aria-hidden />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void onResume()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
              >
                <Play className="h-4 w-4" aria-hidden />
                Resume
              </button>
            )}
            <button
              type="button"
              onClick={() => void onEndSession()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background"
            >
              <Square className="h-4 w-4" aria-hidden />
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
