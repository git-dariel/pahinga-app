import { useEffect, useState } from 'react'
import { Droplets } from 'lucide-react'
import type { WaterReminderTriggerPayload } from '@shared/types'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { dispatchDashboardRefresh } from '@renderer/lib/dashboardEvents'
import { pahingaApi } from '@renderer/services/pahingaApi'

type Phase = 'prompt' | 'done'

export function WaterReminderModal(props: {
  payload: WaterReminderTriggerPayload | null
  onDismiss: () => void
}): React.JSX.Element | null {
  const { payload, onDismiss } = props
  const { showToast } = useToast()
  const [phase, setPhase] = useState<Phase>('prompt')
  const [enter, setEnter] = useState(false)

  useEffect(() => {
    if (!payload) {
      setEnter(false)
      setPhase('prompt')
      return
    }
    setPhase('prompt')
    const id = requestAnimationFrame(() => setEnter(true))

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance('Time to drink some water. Stay hydrated.')
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

  async function onDone(): Promise<void> {
    if (!payload) return
    try {
      await pahingaApi.waterReminderComplete(payload.reminderId)
      dispatchDashboardRefresh()
      setPhase('done')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save water reminder.', 'error')
    }
  }

  async function onSnooze(): Promise<void> {
    if (!payload) return
    try {
      await pahingaApi.waterReminderSnooze(payload.reminderId)
      dispatchDashboardRefresh()
      onDismiss()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not snooze reminder.', 'error')
    }
  }

  async function onSkip(): Promise<void> {
    if (!payload) return
    try {
      await pahingaApi.waterReminderSkip(payload.reminderId)
      dispatchDashboardRefresh()
      onDismiss()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not skip reminder.', 'error')
    }
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
        className={`w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg transition-all duration-200 ease-out ${
          enter ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] translate-y-1'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="water-reminder-title"
      >
        {phase === 'prompt' ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-soft">
                <Droplets size={20} className="text-primary" />
              </div>
              <div>
                <h2 id="water-reminder-title" className="text-base font-semibold text-foreground">
                  Time to hydrate
                </h2>
                <p className="text-xs text-muted">Drink some water. Stay hydrated while working.</p>
              </div>
            </div>
            <p className="text-sm text-muted mb-6">{payload.message}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void onDone()}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => void onSnooze()}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background"
              >
                Remind Me Later
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

        {phase === 'done' ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-soft">
                <Droplets size={20} className="text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Great job staying hydrated!</h2>
            </div>
            <p className="text-sm text-muted mb-6">Keep it up. Water helps you stay focused and energized.</p>
            <button
              type="button"
              onClick={onDismiss}
              className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90"
            >
              Continue Working
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
