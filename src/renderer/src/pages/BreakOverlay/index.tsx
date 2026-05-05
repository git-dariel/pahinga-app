import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BreakOverlayTriggerPayload } from '@shared/types'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { formatClock } from '@renderer/lib/formatClock'
import { pahingaApi } from '@renderer/services/pahingaApi'

type Phase = 'prompt' | 'breaking' | 'done'
type VideoStage = 'intro' | 'loop'

export default function BreakOverlay(): React.JSX.Element {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [payload, setPayload] = useState<BreakOverlayTriggerPayload | null>(null)
  const [phase, setPhase] = useState<Phase>('prompt')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [nekoUrls, setNekoUrls] = useState<{ intro: string; loop: string } | null>(null)
  const [videoStage, setVideoStage] = useState<VideoStage>('intro')
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    document.documentElement.classList.add('pahinga-overlay')
    return () => {
      document.documentElement.classList.remove('pahinga-overlay')
    }
  }, [])

  useEffect(() => {
    void pahingaApi.getNekoUrls().then(setNekoUrls)
  }, [])

  useEffect(() => {
    function applyPayload(next: BreakOverlayTriggerPayload): void {
      setPayload(next)
      setPhase('prompt')
      setSecondsLeft(Math.max(1, next.durationMinutes) * 60)
      setVideoStage('intro')
      setShowExitConfirm(false)
    }

    const unsub = pahingaApi.onOverlayBreakTriggered(applyPayload)
    void pahingaApi.getBreakOverlayPayload().then((initial) => {
      if (initial) applyPayload(initial)
    })
    return unsub
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !nekoUrls) return
    const src = videoStage === 'intro' ? nekoUrls.intro : nekoUrls.loop
    video.src = src
    video.loop = videoStage === 'loop'
    video.load()
    void video.play().catch(() => {})
  }, [videoStage, nekoUrls])

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

  function onVideoEnded(): void {
    if (videoStage === 'intro') setVideoStage('loop')
  }

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
    const isStrict = payload.overlayMode === 'strict_rest_lock'
    if (isStrict && !showExitConfirm) {
      setShowExitConfirm(true)
      return
    }
    await pahingaApi.overlayEmergencyExit(payload.reminderId)
    await onCloseWindow()
  }

  async function onStartAnotherFocus(): Promise<void> {
    await pahingaApi.sessionStart()
    await onCloseWindow()
  }

  if (!payload) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent text-surface">
        <p className="text-sm text-background/90">Preparing break overlay...</p>
      </div>
    )
  }

  const isStrict = payload.overlayMode === 'strict_rest_lock'

  return (
    <div className="h-screen w-screen relative overflow-hidden select-none">
      {/* Subtle left-side gradient for text legibility */}
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Neko video — large, right side, anchored to bottom */}
      <div
        className="absolute right-0 bottom-0 h-full flex items-end justify-end z-0"
        style={{ width: '65%' }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          onEnded={onVideoEnded}
          className={`h-full w-full object-contain object-bottom drop-shadow-2xl ${
            videoStage === 'intro' ? 'overlay-neko-intro-slide' : ''
          }`}
        />
      </div>

      {/* Content panel — left side */}
      <div
        className="absolute left-0 inset-y-0 flex flex-col justify-center px-10 z-20"
        style={{ width: '50%' }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-primary-soft">
          {payload.suggestedType}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-surface drop-shadow-lg md:text-4xl">
          {payload.message}
        </h1>
        <p className="mt-2 text-base text-background/85 drop-shadow">{payload.instruction}</p>

        {isStrict && phase !== 'done' ? (
          <p className="mt-3 text-xs font-medium text-warning/95">
            Strict Rest Lock is active. Stay away from work until your break ends.
          </p>
        ) : null}

        {phase === 'breaking' ? (
          <p
            className="mt-6 text-8xl font-bold tabular-nums text-surface"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
          >
            {formatClock(secondsLeft)}
          </p>
        ) : null}

        {phase === 'prompt' ? (
          <div className="mt-7 space-y-3 max-w-xs">
            <button
              type="button"
              onClick={() => void onStartBreak()}
              className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-surface transition-colors hover:bg-primary/90"
            >
              Start Break
            </button>

            {/* Snooze: hidden in strict mode */}
            {!isStrict && payload.allowSnooze ? (
              <button
                type="button"
                onClick={() => void onSnooze()}
                className="w-full rounded-xl border border-border/60 px-5 py-3 font-semibold text-surface transition-colors hover:bg-surface/10"
              >
                Snooze 5 min
              </button>
            ) : null}

            {/* Emergency Exit */}
            {payload.allowEmergencyExit ? (
              showExitConfirm ? (
                <div className="space-y-3 rounded-xl border border-danger/40 bg-black/40 p-4">
                  <p className="text-sm font-medium text-background/95">
                    Are you sure? Exiting early defeats the purpose of your break.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onEmergencyExit()}
                      className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-danger/90"
                    >
                      Exit Anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(false)}
                      className="flex-1 rounded-lg border border-border/50 px-4 py-2 text-sm font-medium text-background/80 transition-colors hover:bg-surface/10"
                    >
                      Keep Resting
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void onEmergencyExit()}
                  className={`w-full rounded-xl border px-5 py-3 text-sm font-medium transition-colors ${
                    isStrict
                      ? 'border-border/20 text-background/40 hover:bg-surface/5 hover:text-background/60'
                      : 'border-border/35 text-background/80 hover:bg-surface/8'
                  }`}
                >
                  Emergency Exit
                </button>
              )
            ) : null}
          </div>
        ) : null}

        {phase === 'breaking' ? (
          <div className="mt-6 max-w-xs space-y-3">
            {/* During break: snooze hidden in strict mode */}
            {!isStrict && payload.allowSnooze ? (
              <button
                type="button"
                onClick={() => void onSnooze()}
                className="w-full rounded-xl border border-border/40 px-5 py-2.5 text-sm font-medium text-background/80 transition-colors hover:bg-surface/10"
              >
                Snooze 5 min
              </button>
            ) : null}

            {payload.allowEmergencyExit ? (
              showExitConfirm ? (
                <div className="space-y-3 rounded-xl border border-danger/40 bg-black/40 p-4">
                  <p className="text-sm font-medium text-background/95">
                    Are you sure? Exiting early defeats the purpose of your break.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onEmergencyExit()}
                      className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-danger/90"
                    >
                      Exit Anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(false)}
                      className="flex-1 rounded-lg border border-border/50 px-4 py-2 text-sm font-medium text-background/80 transition-colors hover:bg-surface/10"
                    >
                      Keep Resting
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void onEmergencyExit()}
                  className={`w-full rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors ${
                    isStrict
                      ? 'border-border/20 text-background/35 hover:bg-surface/5 hover:text-background/55'
                      : 'border-border/35 text-background/75 hover:bg-surface/8'
                  }`}
                >
                  Emergency Exit
                </button>
              )
            ) : null}
          </div>
        ) : null}

        {phase === 'done' ? (
          <div className="mt-6 space-y-3 max-w-xs">
            <p className="text-xl font-semibold text-surface drop-shadow">
              Break complete. Great job resting!
            </p>
            <button
              type="button"
              onClick={() => void onCloseWindow()}
              className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-surface transition-colors hover:bg-primary/90"
            >
              Continue Working
            </button>
            <button
              type="button"
              onClick={() => void onStartAnotherFocus()}
              className="w-full rounded-xl border border-border/60 px-5 py-3 font-semibold text-surface transition-colors hover:bg-surface/10"
            >
              Start Another Focus Session
            </button>
            <button
              type="button"
              onClick={() => navigate('/stretch')}
              className="w-full rounded-xl border border-border/40 px-5 py-3 font-medium text-background/80 transition-colors hover:bg-surface/8"
            >
              Open Stretch Guide
            </button>
            <button
              type="button"
              onClick={() => void onCloseWindow()}
              className="w-full rounded-xl border border-border/30 px-5 py-3 font-medium text-background/60 transition-colors hover:bg-surface/8"
            >
              Exit Overlay
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
