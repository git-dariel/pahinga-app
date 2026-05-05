import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import type { StretchType } from '@shared/types'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { formatClock } from '@renderer/lib/formatClock'
import { pahingaApi } from '@renderer/services/pahingaApi'

type StretchDef = {
  type: StretchType
  label: string
  description: string
  instruction: string
  durationSeconds: number
}

const STRETCHES: StretchDef[] = [
  {
    type: 'neck',
    label: 'Neck',
    description: 'Relieve neck tension from looking at your screen.',
    instruction:
      'Slowly tilt your head toward your left shoulder and hold for a few seconds. Then switch to the right side. Repeat 3 times each way to release neck tightness.',
    durationSeconds: 30
  },
  {
    type: 'shoulder',
    label: 'Shoulder',
    description: 'Release shoulder tightness from poor posture.',
    instruction:
      'Roll your shoulders backward in a slow, smooth circle. Complete 10 full rolls, then reverse direction. Keep your back straight and breathe steadily.',
    durationSeconds: 30
  },
  {
    type: 'wrist',
    label: 'Wrist',
    description: 'Reduce wrist strain from typing and mouse use.',
    instruction:
      'Extend your right arm in front of you, then gently pull the fingers back with your other hand. Hold for 10 seconds, then switch hands. Repeat twice per hand.',
    durationSeconds: 30
  },
  {
    type: 'eyes',
    label: 'Eyes (20-20-20)',
    description: 'Rest your eyes to reduce digital eye strain.',
    instruction:
      'Look away from your screen and focus on something at least 20 feet (6 meters) away. Hold your gaze for the full duration. Blink naturally to refresh your eyes.',
    durationSeconds: 20
  }
]

type Phase = 'list' | 'detail' | 'timer' | 'done'

export default function StretchGuide(): React.JSX.Element {
  const { showToast } = useToast()
  const [phase, setPhase] = useState<Phase>('list')
  const [selected, setSelected] = useState<StretchDef | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [completedToday, setCompletedToday] = useState(0)

  const loadTodayCount = useCallback(async () => {
    try {
      const logs = await pahingaApi.stretchGetToday()
      setCompletedToday(logs.length)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    void loadTodayCount()
  }, [loadTodayCount])

  function onSelectStretch(def: StretchDef): void {
    setSelected(def)
    setPhase('detail')
  }

  function onStartTimer(): void {
    if (!selected) return
    setSecondsLeft(selected.durationSeconds)
    setPhase('timer')
  }

  function onBack(): void {
    setPhase('list')
    setSelected(null)
  }

  useEffect(() => {
    if (phase !== 'timer' || !selected) return

    let left = selected.durationSeconds
    setSecondsLeft(left)

    const interval = window.setInterval(() => {
      left -= 1
      setSecondsLeft(left)
      if (left > 0) return
      clearInterval(interval)
      void (async () => {
        try {
          await pahingaApi.stretchComplete(selected.type, selected.durationSeconds)
          await loadTodayCount()
          setPhase('done')
        } catch (e) {
          showToast(e instanceof Error ? e.message : 'Could not save stretch.', 'error')
          setPhase('done')
        }
      })()
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, selected, loadTodayCount, showToast])

  function onDone(): void {
    setPhase('list')
    setSelected(null)
  }

  function onDoAnother(): void {
    if (!selected) return
    setSecondsLeft(selected.durationSeconds)
    setPhase('timer')
  }

  return (
    <div className="p-8 max-w-2xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Stretch Guide</h1>
          <p className="text-sm text-muted mt-1">Quick stretches to ease computer-related discomfort.</p>
        </div>
        {completedToday > 0 ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-success shrink-0 mt-1">
            <CheckCircle size={14} />
            {completedToday} completed today
          </div>
        ) : null}
      </header>

      {phase === 'list' ? (
        <div className="grid grid-cols-2 gap-4">
          {STRETCHES.map((def) => (
            <button
              key={def.type}
              type="button"
              onClick={() => onSelectStretch(def)}
              className="bg-surface border border-border rounded-xl p-5 text-left hover:border-primary hover:shadow-sm transition-all cursor-pointer group"
            >
              <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {def.label}
              </p>
              <p className="text-sm text-muted mt-1 leading-snug">{def.description}</p>
              <p className="mt-4 text-xs font-medium text-primary">
                {def.durationSeconds}s · Start →
              </p>
            </button>
          ))}
        </div>
      ) : null}

      {phase === 'detail' && selected ? (
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <h2 className="text-xl font-bold text-foreground">{selected.label}</h2>
          <p className="text-sm text-muted mt-1">{selected.description}</p>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Instruction</p>
              <p className="mt-1.5 text-sm text-foreground leading-relaxed">{selected.instruction}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Duration</p>
              <p className="mt-1.5 text-sm text-foreground">{selected.durationSeconds} seconds</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartTimer}
            className="mt-8 w-full px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Stretch
          </button>
        </div>
      ) : null}

      {phase === 'timer' && selected ? (
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md flex flex-col items-center text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">{selected.label}</p>
          <p
            className="mt-4 text-7xl font-bold text-foreground tabular-nums tracking-tight"
            aria-live="polite"
          >
            {formatClock(secondsLeft)}
          </p>
          <p className="mt-4 text-sm text-muted max-w-xs leading-relaxed">{selected.instruction}</p>
          <p className="mt-6 text-xs text-muted">Relax and breathe steadily.</p>
        </div>
      ) : null}

      {phase === 'done' && selected ? (
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Nice. Stretch completed.</h2>
          <p className="mt-2 text-sm text-muted">
            Great job taking care of your body. Regular stretches reduce long-term discomfort.
          </p>
          <div className="mt-8 flex flex-col w-full gap-2">
            <button
              type="button"
              onClick={onDoAnother}
              className="w-full px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Do it again
            </button>
            <button
              type="button"
              onClick={onDone}
              className="w-full px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background transition-colors"
            >
              Back to Stretch Guide
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
