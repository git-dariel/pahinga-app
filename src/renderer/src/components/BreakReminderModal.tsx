import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BreakReminderTriggerPayload } from '@shared/types'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { dispatchDashboardRefresh } from '@renderer/lib/dashboardEvents'
import { formatClock } from '@renderer/lib/formatClock'
import { pahingaApi } from '@renderer/services/pahingaApi'

type Phase = 'prompt' | 'breaking' | 'done'

export function BreakReminderModal(props: {
  payload: BreakReminderTriggerPayload | null
  onDismiss: () => void
}): React.JSX.Element | null {
  const { payload, onDismiss } = props
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [phase, setPhase] = useState<Phase>('prompt')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [enter, setEnter] = useState(false)

  useEffect(() => {
    if (!payload) {
      setEnter(false)
      setPhase('prompt')
      return
    }
    setPhase('prompt')
    const id = requestAnimationFrame(() => setEnter(true))

    // Voice notification so the user hears the reminder even if the app is in the background.
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(
        'Time for a short break. Stand up, stretch, and rest your eyes.'
      )
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }

    return () => {
      cancelAnimationFrame(id)
      window.speechSynthesis?.cancel()
    }
  }, [payload])

  useEffect(() => {
    if (phase !== 'breaking' || !payload) return
    const totalSec = Math.max(1, payload.durationMinutes) * 60
    let left = totalSec
    setSecondsLeft(left)
    let completed = false
    const interval = window.setInterval(() => {
      left -= 1
      setSecondsLeft(left)
      if (left > 0) return
      clearInterval(interval)
      if (completed) return
      completed = true
      void (async () => {
        try {
          await pahingaApi.reminderComplete(payload.reminderId)
          dispatchDashboardRefresh()
          setPhase('done')
        } catch (e) {
          showToast(e instanceof Error ? e.message : 'Could not save break.', 'error')
          onDismiss()
        }
      })()
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, payload, onDismiss, showToast])

  async function onSkip(): Promise<void> {
    if (!payload) return
    try {
      await pahingaApi.reminderSkip(payload.reminderId)
      dispatchDashboardRefresh()
      onDismiss()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not skip reminder.', 'error')
    }
  }

  async function onSnooze(): Promise<void> {
    if (!payload) return
    try {
      await pahingaApi.reminderSnooze(payload.reminderId)
      dispatchDashboardRefresh()
      onDismiss()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not snooze reminder.', 'error')
    }
  }

  function onStartBreak(): void {
    setPhase('breaking')
  }

  function onStartFocusAfterBreak(): void {
    onDismiss()
    navigate('/focus')
  }

  function onBackToDashboard(): void {
    onDismiss()
    navigate('/dashboard')
  }

  if (!payload) return null

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/45 transition-opacity duration-200 ease-out ${
        enter ? 'opacity-100' : 'opacity-0'
      }`}
      role="presentation"
    >
      <div
        className={`w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg transition-all duration-200 ease-out ${
          enter ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] translate-y-1'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="break-reminder-title"
      >
        {phase === 'prompt' ? (
          <>
            <h2 id="break-reminder-title" className="text-lg font-semibold text-foreground">
              Time for a break
            </h2>
            <p className="mt-1 text-sm text-muted">
              Time for a short break. Stand up, stretch, and rest your eyes.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wide">Suggested break</dt>
                <dd className="text-foreground mt-0.5">{payload.suggestedType}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wide">Duration</dt>
                <dd className="text-foreground mt-0.5">{payload.durationMinutes} minutes</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted uppercase tracking-wide">Instruction</dt>
                <dd className="text-foreground mt-0.5">{payload.instruction}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={onStartBreak}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
              >
                Start Break
              </button>
              <button
                type="button"
                onClick={() => void onSnooze()}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background"
              >
                Snooze 5 min
              </button>
              <button
                type="button"
                onClick={() => void onSkip()}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-muted text-sm font-semibold hover:bg-background hover:text-foreground"
              >
                Skip
              </button>
            </div>
          </>
        ) : null}

        {phase === 'breaking' ? (
          <div className="text-center py-2">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Break time</p>
            <p
              className="mt-3 text-5xl font-bold text-foreground tabular-nums"
              aria-live="polite"
            >
              {formatClock(secondsLeft)}
            </p>
            <p className="mt-3 text-sm text-muted">Relax — you can get back to focus when this ends.</p>
          </div>
        ) : null}

        {phase === 'done' ? (
          <>
            <h2 className="text-lg font-semibold text-foreground text-center">
              Break complete. Ready to continue?
            </h2>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={onStartFocusAfterBreak}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
              >
                Start Focus
              </button>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background"
              >
                Back to Dashboard
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
