import { useEffect, useState } from 'react'
import {
  Bell,
  Coffee,
  Droplets,
  Timer,
  TrendingUp,
  Pause,
  Play,
  Square,
  Sparkles
} from 'lucide-react'
import type { TrayStatus } from '@shared/types'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { Button, Card, EmptyState, PageShell } from '@renderer/components/ui'
import { formatClock } from '@renderer/lib/formatClock'
import { useDashboard } from '@renderer/hooks/useDashboard'
import { pahingaApi } from '@renderer/services/pahingaApi'

function StatCard({
  icon: Icon,
  label,
  value,
  hint
}: {
  icon: typeof Timer
  label: string
  value: string
  hint: string
}): React.JSX.Element {
  return (
    <Card className="flex min-h-30 flex-col gap-1 p-5">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
      <p className="text-xs text-muted mt-auto leading-snug">{hint}</p>
    </Card>
  )
}

function TrayStatusBadge({ trayStatus }: { trayStatus: TrayStatus | null }): React.JSX.Element {
  const active = trayStatus?.active ?? false

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-sm"
      title={
        trayStatus?.closeToTrayEnabled
          ? 'Reminders keep running when the app is closed to tray.'
          : 'Tray controls are available from the system menu.'
      }
    >
      <span
        className={`h-2 w-2 rounded-full ${active ? 'bg-success' : 'bg-warning'}`}
        aria-hidden
      />
      <Bell className="h-3.5 w-3.5" aria-hidden />
      <span>Tray {active ? 'active' : 'starting'}</span>
    </div>
  )
}

export default function Dashboard(): React.ReactNode {
  const { data, status, error, refresh, startSession, pauseSession, resumeSession, stopSession } =
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

  const idle = data?.sessionPhase === 'idle'
  const focusing = data?.sessionPhase === 'focusing'
  const paused = data?.sessionPhase === 'paused'

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

  const showEmptyStats =
    data &&
    idle &&
    data.summary.totalFocusMinutes === 0 &&
    data.summary.focusSessionCount === 0 &&
    data.summary.breaksTaken === 0

  if (status === 'loading' && !data) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 rounded-lg bg-border animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-border/80 animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl">
          <div className="lg:col-span-2 h-56 rounded-xl bg-border animate-pulse" />
          <div className="space-y-4">
            <div className="h-28 rounded-xl bg-border animate-pulse" />
            <div className="h-28 rounded-xl bg-border animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' && !data) {
    return (
      <div className="p-8 max-w-lg">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-4 text-sm text-danger">{error?.message ?? 'Failed to load dashboard.'}</p>
        <Button type="button" onClick={() => void refresh()} className="mt-4">
          Try again
        </Button>
      </div>
    )
  }

  if (!data) return null

  const focusLabel = paused ? 'Paused' : focusing ? 'Focusing' : 'Ready to focus'
  const focusHint = idle
    ? `Default block: ${data.settings.focusDuration} min - Open the timer for more options.`
    : paused
      ? 'Timer is paused. Resume when you are ready.'
      : 'Stay with your task until this block ends.'

  const breakLine =
    idle || data.nextBreakInMinutes === null
      ? 'Start a focus session to see your next break.'
      : `Next break in ${data.nextBreakInMinutes} minute${data.nextBreakInMinutes === 1 ? '' : 's'}`

  const waterLine =
    idle || data.nextWaterInMinutes === null
      ? 'Start a focus session for water reminders.'
      : `Next water reminder in ${data.nextWaterInMinutes} minute${data.nextWaterInMinutes === 1 ? '' : 's'}`

  const workMinutesDisplay = data.summary.totalFocusMinutes
  const breaksDisplay = data.summary.breaksTaken

  return (
    <PageShell
      title="Dashboard"
      description="A calm view of your session, reminders, and today's progress."
      action={<TrayStatusBadge trayStatus={trayStatus} />}
      className="max-w-5xl"
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-warning/40 bg-surface px-4 py-3 text-sm text-warning">
          {error.message}
        </div>
      ) : null}

      <div className="space-y-4">
        <Card className="flex min-h-56 flex-col items-center rounded-2xl p-6 text-center">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Current focus</p>
            <p className="text-lg font-semibold text-foreground mt-1">{focusLabel}</p>
            <p className="text-sm text-muted mt-1 max-w-md">{focusHint}</p>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center">
            <p
              className="text-5xl font-bold text-foreground tabular-nums tracking-tight"
              aria-live="polite"
            >
              {idle ? '-' : formatClock(data.focusRemainingSeconds)}
            </p>
            {!idle ? (
              <p className="mt-2 text-sm text-muted">
                of {formatClock(data.settings.focusDuration * 60)} planned
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="secondary" onClick={() => void onTestBreakOverlay()}>
              <Sparkles className="h-4 w-4" aria-hidden />
              Test Break Overlay
            </Button>

            {idle ? (
              <Button type="button" onClick={() => void onStart()}>
                <Play className="h-4 w-4" aria-hidden />
                Start Focus
              </Button>
            ) : null}

            {focusing ? (
              <Button type="button" variant="secondary" onClick={() => void onPause()}>
                <Pause className="h-4 w-4" aria-hidden />
                Pause
              </Button>
            ) : null}

            {paused ? (
              <Button type="button" onClick={() => void onResume()}>
                <Play className="h-4 w-4" aria-hidden />
                Resume
              </Button>
            ) : null}

            {!idle ? (
              <Button type="button" variant="secondary" onClick={() => void onStop()}>
                <Square className="h-4 w-4" aria-hidden />
                Stop Session
              </Button>
            ) : null}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={Coffee}
            label="Next break"
            value={idle ? '-' : `${data.nextBreakInMinutes ?? 0} min`}
            hint={breakLine}
          />
          <StatCard
            icon={Droplets}
            label="Next water"
            value={idle ? '-' : `${data.nextWaterInMinutes ?? 0} min`}
            hint={waterLine}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <StatCard
          icon={TrendingUp}
          label="Today's work time"
          value={workMinutesDisplay === 0 ? '0 min' : `${workMinutesDisplay} min`}
          hint={
            data.summary.focusSessionCount === 0
              ? 'Completed focus blocks today.'
              : `${data.summary.focusSessionCount} focus session${data.summary.focusSessionCount === 1 ? '' : 's'} completed.`
          }
        />
        <StatCard
          icon={Timer}
          label="Breaks taken"
          value={`${breaksDisplay}`}
          hint={
            breaksDisplay === 0
              ? 'Break reminders you complete show up here.'
              : 'Great rhythm - keep resting between deep work.'
          }
        />
      </div>

      {showEmptyStats ? (
        <EmptyState
          className="mt-8"
          icon={<Sparkles className="h-5 w-5 text-primary" aria-hidden />}
          title="Your day is a fresh start"
          description="When you're ready, start a short focus block. Your time, breaks, and water nudges will show up on this dashboard so you can see progress at a glance."
        />
      ) : null}
    </PageShell>
  )
}
