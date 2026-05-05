import { useEffect, useState } from 'react'
import {
  Bell,
  CheckCircle,
  Coffee,
  Droplets,
  Pause,
  Play,
  Square,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import type { TrayStatus } from '@shared/types'
import {
  DesignButton,
  DesignCard,
  Pill,
  RingTimer,
  ScreenHeader,
  SmallIconBox
} from '@renderer/components/design'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { formatClock } from '@renderer/lib/formatClock'
import { useDashboard } from '@renderer/hooks/useDashboard'
import { pahingaApi } from '@renderer/services/pahingaApi'

function TrayStatusBadge({ trayStatus }: { trayStatus: TrayStatus | null }): React.JSX.Element {
  const active = trayStatus?.active ?? false

  return (
    <Pill>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-primary' : 'bg-warning'}`} />
      <Bell className="h-3.5 w-3.5" aria-hidden />
      <span>Tray {active ? 'active' : 'starting'}</span>
    </Pill>
  )
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  hint,
  progress
}: {
  icon: typeof Coffee
  label: string
  value: string
  unit?: string
  hint: string
  progress: number
}): React.JSX.Element {
  return (
    <DesignCard className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <SmallIconBox icon={icon} tone="beige" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-[30px] font-bold leading-none text-foreground tabular-nums">{value}</p>
        {unit ? <p className="pb-1 text-sm font-semibold text-muted">{unit}</p> : null}
      </div>
      <p className="mt-2 text-xs text-muted">{hint}</p>
      <div className="mt-3 h-0.5 rounded-full bg-[#e7e0d5]">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(8, Math.min(100, progress))}%` }}
        />
      </div>
    </DesignCard>
  )
}

export default function Dashboard(): React.ReactNode {
  const { data, status, error, startSession, pauseSession, resumeSession, stopSession } =
    useDashboard()
  const { showToast } = useToast()
  const [trayStatus, setTrayStatus] = useState<TrayStatus | null>(null)

  useEffect(() => {
    let mounted = true
    void pahingaApi
      .getTrayStatus()
      .then((next) => {
        if (mounted) setTrayStatus(next)
      })
      .catch(() => {
        if (mounted) setTrayStatus(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  async function onStart(): Promise<void> {
    try {
      await startSession()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not start focus session.', 'error')
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

  async function onStop(): Promise<void> {
    try {
      await stopSession()
      showToast('Session stopped.', 'info')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not stop session.', 'error')
    }
  }

  async function onTestBreakOverlay(): Promise<void> {
    try {
      await pahingaApi.overlayOpenBreak('break_reminder')
      showToast('Test break overlay opened.', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not open break overlay test.', 'error')
    }
  }

  if (status === 'loading' && !data) {
    return <div className="mx-auto max-w-[1080px] px-8 py-10 text-sm text-muted">Loading...</div>
  }

  if (!data) return null

  const idle = data.sessionPhase === 'idle'
  const focusing = data.sessionPhase === 'focusing'
  const paused = data.sessionPhase === 'paused'
  const targetSeconds = (data.activeSession?.targetMinutes ?? data.settings.focusDuration) * 60
  const elapsedProgress = idle ? 0 : 1 - data.focusRemainingSeconds / Math.max(1, targetSeconds)
  const breakValue = idle ? '-' : String(data.nextBreakInMinutes ?? 0)
  const waterValue = idle ? '-' : String(data.nextWaterInMinutes ?? 0)

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-10">
      <ScreenHeader
        title="Dashboard"
        description="A calm view of your session, reminders, and today's progress."
        action={<TrayStatusBadge trayStatus={trayStatus} />}
      />

      {error ? (
        <div className="mb-4 rounded-md border border-warning/40 bg-surface px-4 py-3 text-sm text-warning">
          {error.message}
        </div>
      ) : null}

      <DesignCard className="relative mb-5 min-h-[405px] p-8">
        <div className="absolute left-8 top-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Current focus
        </div>
        <div className="absolute right-9 top-8 flex items-center gap-2 text-xs font-semibold text-foreground">
          <span className={`h-2 w-2 rounded-full ${focusing ? 'bg-primary' : 'bg-muted/40'}`} />
          {paused ? 'Paused' : focusing ? 'Focusing' : 'Ready'}
        </div>

        <div className="flex h-full min-h-[335px] flex-col items-center justify-center pt-8">
          <RingTimer
            value={idle ? '-' : formatClock(data.focusRemainingSeconds)}
            subtitle={!idle ? `of ${formatClock(targetSeconds)} planned` : undefined}
            progress={elapsedProgress}
          />
          <p className="mt-8 text-sm text-muted">
            {paused
              ? 'Timer is paused. Resume when you are ready.'
              : focusing
                ? 'Stay with your task until this block ends.'
                : `Default block: ${data.settings.focusDuration} min.`}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <DesignButton type="button" onClick={() => void onTestBreakOverlay()}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Test break overlay
            </DesignButton>
            {idle ? (
              <DesignButton type="button" variant="primary" onClick={() => void onStart()}>
                <Play className="h-3.5 w-3.5" aria-hidden />
                Start focus
              </DesignButton>
            ) : null}
            {focusing ? (
              <DesignButton type="button" onClick={() => void onPause()}>
                <Pause className="h-3.5 w-3.5" aria-hidden />
                Pause
              </DesignButton>
            ) : null}
            {paused ? (
              <DesignButton type="button" variant="primary" onClick={() => void onResume()}>
                <Play className="h-3.5 w-3.5" aria-hidden />
                Resume
              </DesignButton>
            ) : null}
            {!idle ? (
              <DesignButton type="button" onClick={() => void onStop()}>
                <Square className="h-3.5 w-3.5" aria-hidden />
                Stop session
              </DesignButton>
            ) : null}
          </div>
        </div>
      </DesignCard>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <MetricCard
          icon={Coffee}
          label="Next break"
          value={breakValue}
          unit={idle ? undefined : 'min'}
          hint={idle ? 'Start a focus session' : `Next break in ${data.nextBreakInMinutes} minutes`}
          progress={idle ? 0 : 20}
        />
        <MetricCard
          icon={Droplets}
          label="Next water"
          value={waterValue}
          unit={idle ? undefined : 'min'}
          hint={idle ? 'Start a focus session' : 'Hydration reminder soon'}
          progress={idle ? 0 : 55}
        />
        <MetricCard
          icon={TrendingUp}
          label="Today's work"
          value={String(data.summary.totalFocusMinutes)}
          unit="min"
          hint={`${data.summary.focusSessionCount} sessions completed`}
          progress={62}
        />
        <MetricCard
          icon={CheckCircle}
          label="Breaks taken"
          value={String(data.summary.breaksTaken)}
          hint={`${data.summary.breaksSkipped} skipped today`}
          progress={42}
        />
      </div>
    </div>
  )
}
