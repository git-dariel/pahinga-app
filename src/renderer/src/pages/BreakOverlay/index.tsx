import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BreakOverlayTriggerPayload } from '@shared/types'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { formatClock } from '@renderer/lib/formatClock'
import { pahingaApi } from '@renderer/services/pahingaApi'

type Phase = 'prompt' | 'breaking' | 'done'

const DEFAULT_MEDIA_EMOJI = '🌿'

export default function BreakOverlay(): React.JSX.Element {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [payload, setPayload] = useState<BreakOverlayTriggerPayload | null>(null)
  const [phase, setPhase] = useState<Phase>('prompt')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [mediaFailed, setMediaFailed] = useState(false)

  useEffect(() => {
    function applyPayload(next: BreakOverlayTriggerPayload): void {
      setPayload(next)
      setPhase('prompt')
      setSecondsLeft(Math.max(1, next.durationMinutes) * 60)
      setMediaFailed(false)
    }

    const unsub = pahingaApi.onOverlayBreakTriggered(applyPayload)

    void pahingaApi.getBreakOverlayPayload().then((initial) => {
      if (initial) applyPayload(initial)
    })

    return unsub
  }, [])

  useEffect(() => {
    if (!payload || phase !== 'breaking') return
    let left = Math.max(1, payload.durationMinutes) * 60
    setSecondsLeft(left)
    const id = window.setInterval(() => {
      left -= 1
      setSecondsLeft(left)
      if (left > 0) return
      clearInterval(id)
      void (async () => {
        try {
          await pahingaApi.overlayCompleteBreak(payload.reminderId)
          setPhase('done')
        } catch (error) {
          showToast(error instanceof Error ? error.message : 'Could not complete break.', 'error')
        }
      })()
    }, 1000)
    return () => clearInterval(id)
  }, [payload, phase, showToast])

  const media = useMemo(() => {
    if (!payload?.mediaPath) return null
    return payload.mediaPath.toLowerCase().endsWith('.mp4') ? 'video' : 'gif'
  }, [payload?.mediaPath])

  const mediaSrc = useMemo(() => {
    if (!payload?.mediaPath) return undefined
    return payload.mediaPath.startsWith('file://') ? payload.mediaPath : undefined
  }, [payload?.mediaPath])

  async function onCloseWindow(): Promise<void> {
    await pahingaApi.overlayCloseBreak()
  }

  async function onStartBreak(): Promise<void> {
    if (!payload) return
    await pahingaApi.overlayStartBreak(payload.reminderId)
    setPhase('breaking')
  }

  async function onSnooze(): Promise<void> {
    if (!payload) return
    await pahingaApi.overlaySnoozeBreak(payload.reminderId)
    await onCloseWindow()
  }

  async function onEmergencyExit(): Promise<void> {
    if (!payload) return
    await pahingaApi.overlayEmergencyExit(payload.reminderId)
    await onCloseWindow()
  }

  async function onCompleteClose(): Promise<void> {
    await onCloseWindow()
  }

  async function onStartAnotherFocus(): Promise<void> {
    await pahingaApi.sessionStart()
    await onCloseWindow()
  }

  if (!payload) {
    return (
      <div className="h-screen w-screen bg-black/30 backdrop-blur-xl text-white flex items-center justify-center">
        <p className="text-sm text-white/85">Preparing break overlay…</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-[rgba(5,10,20,0.35)] backdrop-blur-xl text-white p-4 sm:p-8 md:p-10 flex items-center justify-center">
      <div className="w-full h-full rounded-3xl border border-white/20 bg-[rgba(10,19,36,0.55)] shadow-2xl p-6 sm:p-8 md:p-10">
        <div className="grid h-full gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
          <div className="rounded-2xl border border-white/15 bg-[rgba(12,24,45,0.55)] h-[42vh] overflow-hidden flex items-center justify-center">
            {media === 'video' && !mediaFailed ? (
              <video
                src={mediaSrc}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setMediaFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : media === 'gif' && !mediaFailed ? (
              <img
                src={mediaSrc}
                alt="Break media"
                onError={() => setMediaFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <p className="text-7xl sm:text-8xl">{DEFAULT_MEDIA_EMOJI}</p>
                <p className="mt-3 text-sm text-white/80">Relax your body and eyes</p>
                {mediaFailed ? (
                  <p className="mt-2 text-xs text-amber-200/90">
                    Could not load selected media. Using default fallback.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-200/80">{payload.suggestedType}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1 leading-tight">{payload.message}</h1>
            <p className="text-base text-white/85 mt-3">{payload.instruction}</p>

            {phase === 'breaking' ? (
              <p className="text-6xl font-bold tabular-nums mt-6">{formatClock(secondsLeft)}</p>
            ) : null}

            {phase === 'prompt' ? (
              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => void onStartBreak()}
                  className="w-full px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
                >
                  Start Break
                </button>
                {payload.allowSnooze ? (
                  <button
                    type="button"
                    onClick={() => void onSnooze()}
                    className="w-full px-4 py-3 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10"
                  >
                    Snooze 5 min
                  </button>
                ) : null}
                {payload.allowEmergencyExit ? (
                  <button
                    type="button"
                    onClick={() => void onEmergencyExit()}
                    className="w-full px-4 py-3 rounded-xl border border-white/15 text-white/75 font-medium hover:bg-white/5"
                  >
                    Emergency Exit
                  </button>
                ) : null}
              </div>
            ) : null}

            {phase === 'done' ? (
              <div className="mt-6 space-y-2">
                <p className="text-xl font-semibold">Break complete. Great job resting your mind and body.</p>
                <p className="text-sm text-white/80">
                  You finished your break. You can continue when you feel ready.
                </p>
                <button
                  type="button"
                  onClick={() => void onCompleteClose()}
                  className="w-full px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
                >
                  Continue Working
                </button>
                <button
                  type="button"
                  onClick={() => void onStartAnotherFocus()}
                  className="w-full px-4 py-3 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10"
                >
                  Start Another Focus Session
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/stretch')}
                  className="w-full px-4 py-3 rounded-xl border border-white/15 text-white/75 font-medium hover:bg-white/5"
                >
                  Open Stretch Guide
                </button>
                <button
                  type="button"
                  onClick={() => void onCloseWindow()}
                  className="w-full px-4 py-3 rounded-xl border border-white/15 text-white/70 font-medium hover:bg-white/5"
                >
                  Exit Overlay
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
