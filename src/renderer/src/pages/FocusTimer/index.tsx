import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pause, Play, Square } from 'lucide-react'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { DesignButton, DesignCard, RingTimer, ScreenHeader } from '@renderer/components/design'
import { formatClock } from '@renderer/lib/formatClock'
import {
  ensureNotificationPermission,
  notifyFocusSessionComplete
} from '@renderer/lib/focusNotifications'
import { useDashboard } from '@renderer/hooks/useDashboard'

export default function FocusTimer(): React.ReactNode {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data, status, startSession, pauseSession, resumeSession, stopSession } = useDashboard()
  const [showComplete, setShowComplete] = useState(false)
  const userCancelledRef = useRef(false)
  const hadActiveRef = useRef(false)

  const focusing = data?.sessionPhase === 'focusing'
  const paused = data?.sessionPhase === 'paused'
  const active = !!data?.activeSession && (focusing || paused)

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
    try {
      if (data?.settings.notificationsEnabled) void ensureNotificationPermission()
      await startSession(data?.settings.focusDuration)
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

  if (status === 'loading' && !data) {
    return <div className="mx-auto max-w-[960px] px-24 py-10 text-sm text-muted">Loading...</div>
  }

  if (!data) return null

  const targetMinutes = data.activeSession?.targetMinutes ?? data.settings.focusDuration
  const targetSeconds = targetMinutes * 60
  const remaining = data.sessionPhase === 'idle' ? targetSeconds : data.focusRemainingSeconds
  const progress = data.sessionPhase === 'idle' ? 0.05 : 1 - remaining / Math.max(1, targetSeconds)

  return (
    <div className="mx-auto max-w-[960px] px-24 py-10">
      <ScreenHeader
        title="Focus timer"
        description="Work in focused sessions with intentional breaks."
        action={
          <Link
            to="/dashboard"
            className="mt-2 text-xs font-semibold text-primary hover:text-primary/80"
          >
            Back to dashboard →
          </Link>
        }
      />

      <div className="flex min-h-[540px] flex-col items-center justify-center">
        {showComplete ? (
          <DesignCard className="mb-8 w-full max-w-md p-6 text-center">
            <p className="text-lg font-bold text-foreground">Focus session complete</p>
            <p className="mt-2 text-sm text-muted">Take a short break before your next block.</p>
            <div className="mt-5 flex justify-center gap-2">
              <DesignButton type="button" variant="primary" onClick={() => navigate('/stretch')}>
                Start break
              </DesignButton>
              <DesignButton type="button" onClick={() => setShowComplete(false)}>
                Skip
              </DesignButton>
            </div>
          </DesignCard>
        ) : null}

        <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Focus session
        </p>
        <RingTimer
          value={formatClock(remaining)}
          subtitle={`${targetMinutes} min block · break follows`}
          size={334}
          progress={progress}
        />

        <div className="mt-10 flex gap-2">
          {data.sessionPhase === 'idle' ? (
            <DesignButton type="button" variant="primary" onClick={() => void onStart()}>
              <Play className="h-3.5 w-3.5" aria-hidden />
              Start focus
            </DesignButton>
          ) : focusing ? (
            <DesignButton type="button" onClick={() => void onPause()}>
              <Pause className="h-3.5 w-3.5" aria-hidden />
              Pause
            </DesignButton>
          ) : (
            <DesignButton type="button" variant="primary" onClick={() => void onResume()}>
              <Play className="h-3.5 w-3.5" aria-hidden />
              Resume
            </DesignButton>
          )}
          {data.sessionPhase !== 'idle' ? (
            <DesignButton type="button" onClick={() => void onEndSession()}>
              <Square className="h-3.5 w-3.5" aria-hidden />
              End session
            </DesignButton>
          ) : null}
        </div>

        <DesignCard className="mt-12 flex w-full max-w-[545px] items-center justify-between px-6 py-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <div>
              <p className="font-semibold text-foreground">Focus</p>
              <p className="text-muted">25 min · in progress</p>
            </div>
          </div>
          <span className="h-px w-8 bg-border" />
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-muted/30" />
            <div>
              <p className="font-semibold text-foreground">Break</p>
              <p className="text-muted">5 min · stretch + water</p>
            </div>
          </div>
          <span className="h-px w-8 bg-border" />
          <div className="flex items-center gap-3 text-muted/60">
            <span className="h-2.5 w-2.5 rounded-full bg-muted/20" />
            <div>
              <p className="font-semibold">Focus</p>
              <p>25 min · queued</p>
            </div>
          </div>
        </DesignCard>
      </div>
    </div>
  )
}
