import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react'
import type { StretchType } from '@shared/types'
import {
  CompletedPill,
  DesignButton,
  DesignCard,
  RingTimer,
  ScreenHeader,
  SmallIconBox,
  stretchIconMap
} from '@renderer/components/design'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { formatClock } from '@renderer/lib/formatClock'
import { pahingaApi } from '@renderer/services/pahingaApi'

type StretchDef = {
  type: StretchType
  label: string
  description: string
  instruction: string
  durationSeconds: number
  tone: 'green' | 'beige' | 'blue'
}

const STRETCHES: StretchDef[] = [
  {
    type: 'neck',
    label: 'Neck',
    description: 'Relieve neck tension from looking at your screen.',
    instruction:
      'Slowly tilt your head toward your left shoulder and hold for a few seconds. Then switch to the right side. Repeat 3 times each way to release neck tightness.',
    durationSeconds: 30,
    tone: 'green'
  },
  {
    type: 'shoulder',
    label: 'Shoulder',
    description: 'Release shoulder tightness from poor posture.',
    instruction:
      'Roll your shoulders backward in a slow, smooth circle. Complete 10 full rolls, then reverse direction. Keep your back straight and breathe steadily.',
    durationSeconds: 30,
    tone: 'beige'
  },
  {
    type: 'wrist',
    label: 'Wrist',
    description: 'Reduce wrist strain from typing and mouse use.',
    instruction:
      'Extend your right arm in front of you, then gently pull the fingers back with your other hand. Hold for 10 seconds, then switch hands. Repeat twice per hand.',
    durationSeconds: 30,
    tone: 'green'
  },
  {
    type: 'eyes',
    label: 'Eyes (20-20-20)',
    description: 'Rest your eyes to reduce digital eye strain.',
    instruction:
      'Look away from your screen and focus on something at least 20 feet away. Hold your gaze for the full duration. Blink naturally to refresh your eyes.',
    durationSeconds: 20,
    tone: 'blue'
  }
]

type Phase = 'list' | 'detail' | 'timer'

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

  useEffect(() => {
    if (phase !== 'timer' || !selected) return
    let left = selected.durationSeconds
    setSecondsLeft(left)
    const interval = window.setInterval(() => {
      left = Math.max(0, left - 1)
      setSecondsLeft(left)
      if (left === 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, selected])

  function onSelectStretch(def: StretchDef): void {
    setSelected(def)
    setPhase('detail')
  }

  function onBack(): void {
    setPhase('list')
    setSelected(null)
  }

  function onStartTimer(): void {
    if (!selected) return
    setSecondsLeft(selected.durationSeconds)
    setPhase('timer')
  }

  async function onComplete(): Promise<void> {
    if (!selected) return
    try {
      await pahingaApi.stretchComplete(selected.type, selected.durationSeconds)
      await loadTodayCount()
      setPhase('list')
      setSelected(null)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save stretch.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-[1020px] px-24 py-10">
      <ScreenHeader
        title="Stretch guide"
        description="Quick stretches to ease computer-related discomfort."
        action={<CompletedPill count={completedToday} />}
      />

      {phase === 'list' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {STRETCHES.map((def) => {
            const Icon = stretchIconMap[def.type]
            return (
              <button key={def.type} type="button" onClick={() => onSelectStretch(def)}>
                <DesignCard className="flex h-[208px] flex-col p-5 text-left transition-colors hover:border-primary/60">
                  <SmallIconBox icon={Icon} tone={def.tone} />
                  <p className="mt-5 text-base font-bold text-foreground">{def.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{def.description}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-muted">
                    <span>{def.durationSeconds}s ·</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-primary">
                      Start <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </DesignCard>
              </button>
            )
          })}
        </div>
      ) : null}

      {phase === 'detail' && selected ? (
        <div className="mx-auto max-w-[720px]">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All stretches
          </button>
          <DesignCard className="p-9">
            <div className="flex items-center gap-6">
              <SmallIconBox icon={stretchIconMap[selected.type]} tone={selected.tone} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Stretch
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">{selected.label}</h2>
                <p className="mt-1 text-sm text-muted">{selected.description}</p>
              </div>
            </div>
            <div className="my-6 h-px bg-border" />
            <div className="grid grid-cols-[1fr_205px] gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Instructions
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {selected.instruction}
                </p>
                <DesignButton className="mt-8" variant="primary" onClick={onStartTimer}>
                  <Play className="h-3.5 w-3.5 fill-white" /> Start stretch
                </DesignButton>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Duration
                </p>
                <p className="mt-2 text-[38px] font-bold leading-none text-foreground">
                  {selected.durationSeconds}
                  <span className="ml-1 text-sm">s</span>
                </p>
                <p className="mt-2 text-xs text-muted">Slow, steady breathing</p>
              </div>
            </div>
          </DesignCard>
        </div>
      ) : null}

      {phase === 'timer' && selected ? (
        <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
          <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {selected.label}
          </p>
          <RingTimer
            value={formatClock(secondsLeft)}
            size={274}
            progress={1 - secondsLeft / selected.durationSeconds}
          />
          <p className="mt-10 max-w-[420px] text-sm leading-relaxed text-foreground">
            {selected.instruction}
          </p>
          <p className="mt-8 text-xs italic text-muted">Relax and breathe steadily.</p>
          <div className="mt-9 flex gap-2">
            <DesignButton onClick={onBack}>Skip</DesignButton>
            <DesignButton variant="primary" onClick={() => void onComplete()}>
              <Check className="h-3.5 w-3.5" /> Mark complete
            </DesignButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}
