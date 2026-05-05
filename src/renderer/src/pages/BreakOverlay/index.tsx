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
      <div className="h-screen w-screen bg-black/30 text-white flex items-center justify-center">
        <p className="text-sm text-white/85">Preparing break overlay…</p>
      </div>
    )
  }

  const isStrict = payload.overlayMode === 'strict_rest_lock'

  return (
    <div className="h-screen w-screen relative overflow-hidden select-none">
      {/* Subtle left-side gradient for text legibility */}
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Neko video — large, right side, anchored to bottom */}
      <div className="absolute right-0 bottom-0 h-full flex items-end justify-end z-0" style={{ width: '65%' }}>
        <video
          ref={videoRef}
          muted
          playsInline
          onEnded={onVideoEnded}
          className="h-full w-full object-contain object-bottom drop-shadow-2xl"
        />
      </div>

      {/* Content panel — left side */}
      <div className="absolute left-0 inset-y-0 flex flex-col justify-center px-10 z-20" style={{ width: '50%' }}>
        <p className="text-xs uppercase tracking-widest text-cyan-300/80 font-medium">
          {payload.suggestedType}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 leading-tight drop-shadow-lg">
          {payload.message}
        </h1>
        <p className="text-base text-white/75 mt-2 drop-shadow">{payload.instruction}</p>

        {isStrict && phase !== 'done' ? (
          <p className="mt-3 text-xs text-amber-300/90 font-medium">
            Strict Rest Lock is active. Stay away from work until your break ends.
          </p>
        ) : null}

        {phase === 'breaking' ? (
          <p
            className="text-8xl font-bold tabular-nums mt-6 text-white"
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
              className="w-full px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
            >
              Start Break
            </button>

            {/* Snooze: hidden in strict mode */}
            {!isStrict && payload.allowSnooze ? (
              <button
                type="button"
                onClick={() => void onSnooze()}
                className="w-full px-5 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Snooze 5 min
              </button>
            ) : null}

            {/* Emergency Exit */}
            {payload.allowEmergencyExit ? (
              showExitConfirm ? (
                <div className="rounded-xl border border-red-400/40 bg-black/40 p-4 space-y-3">
                  <p className="text-sm text-white/90 font-medium">
                    Are you sure? Exiting early defeats the purpose of your break.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onEmergencyExit()}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500/80 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
                    >
                      Exit Anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Keep Resting
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void onEmergencyExit()}
                  className={`w-full px-5 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    isStrict
                      ? 'border-white/10 text-white/30 hover:text-white/50 hover:bg-white/5'
                      : 'border-white/15 text-white/70 hover:bg-white/5'
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
                className="w-full px-5 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Snooze 5 min
              </button>
            ) : null}

            {payload.allowEmergencyExit ? (
              showExitConfirm ? (
                <div className="rounded-xl border border-red-400/40 bg-black/40 p-4 space-y-3">
                  <p className="text-sm text-white/90 font-medium">
                    Are you sure? Exiting early defeats the purpose of your break.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onEmergencyExit()}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500/80 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
                    >
                      Exit Anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Keep Resting
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void onEmergencyExit()}
                  className={`w-full px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    isStrict
                      ? 'border-white/10 text-white/25 hover:text-white/40 hover:bg-white/5'
                      : 'border-white/15 text-white/60 hover:bg-white/5'
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
            <p className="text-xl font-semibold text-white drop-shadow">
              Break complete. Great job resting!
            </p>
            <button
              type="button"
              onClick={() => void onCloseWindow()}
              className="w-full px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
            >
              Continue Working
            </button>
            <button
              type="button"
              onClick={() => void onStartAnotherFocus()}
              className="w-full px-5 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Start Another Focus Session
            </button>
            <button
              type="button"
              onClick={() => navigate('/stretch')}
              className="w-full px-5 py-3 rounded-xl border border-white/15 text-white/70 font-medium hover:bg-white/5 transition-colors"
            >
              Open Stretch Guide
            </button>
            <button
              type="button"
              onClick={() => void onCloseWindow()}
              className="w-full px-5 py-3 rounded-xl border border-white/10 text-white/50 font-medium hover:bg-white/5 transition-colors"
            >
              Exit Overlay
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
