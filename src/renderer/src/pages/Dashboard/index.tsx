import { Link } from 'react-router-dom'
import { Coffee, Droplets, Timer, TrendingUp, Pause, Play, Square, Sparkles } from 'lucide-react'
import { useToast } from '@renderer/components/Toast/ToastProvider'
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
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-1 min-h-30">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
      <p className="text-xs text-muted mt-auto leading-snug">{hint}</p>
    </div>
  )
}

export default function Dashboard(): React.ReactNode {
  const { data, status, error, refresh, startSession, pauseSession, resumeSession, stopSession } =
    useDashboard()
  const { showToast } = useToast()

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
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  const focusLabel = paused ? 'Paused' : focusing ? 'Focusing' : 'Ready to focus'
  const focusHint = idle
    ? `Default block: ${data.settings.focusDuration} min · Open the timer for more options.`
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
    <div className="p-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          A calm view of your session, reminders, and today&apos;s progress.
        </p>
      </header>

      {error ? (
        <div className="mb-4 rounded-lg border border-warning/40 bg-surface px-4 py-3 text-sm text-warning">
          {error.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 flex flex-col min-h-56">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Current focus</p>
              <p className="text-lg font-semibold text-foreground mt-1">{focusLabel}</p>
              <p className="text-sm text-muted mt-1 max-w-md">{focusHint}</p>
            </div>
            <Link
              to="/focus"
              className="text-sm font-medium text-primary hover:text-primary/80 whitespace-nowrap"
            >
              Focus Timer →
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-6">
            <p
              className="text-5xl font-bold text-foreground tabular-nums tracking-tight"
              aria-live="polite"
            >
              {idle ? '—' : formatClock(data.focusRemainingSeconds)}
            </p>
            {!idle ? (
              <p className="text-sm text-muted pb-1">
                of {formatClock(data.settings.focusDuration * 60)} planned
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onTestBreakOverlay()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-semibold hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Test Break Overlay
            </button>

            {idle ? (
              <button
                type="button"
                onClick={() => void onStart()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Play className="h-4 w-4" aria-hidden />
                Start Focus
              </button>
            ) : null}

            {focusing ? (
              <button
                type="button"
                onClick={() => void onPause()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-semibold hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Pause className="h-4 w-4" aria-hidden />
                Pause
              </button>
            ) : null}

            {paused ? (
              <button
                type="button"
                onClick={() => void onResume()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Play className="h-4 w-4" aria-hidden />
                Resume
              </button>
            ) : null}

            {!idle ? (
              <button
                type="button"
                onClick={() => void onStop()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm font-semibold hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Square className="h-4 w-4" aria-hidden />
                Stop Session
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <StatCard
            icon={Coffee}
            label="Next break"
            value={idle ? '—' : `${data.nextBreakInMinutes ?? 0} min`}
            hint={breakLine}
          />
          <StatCard
            icon={Droplets}
            label="Next water"
            value={idle ? '—' : `${data.nextWaterInMinutes ?? 0} min`}
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
              : 'Great rhythm — keep resting between deep work.'
          }
        />
      </div>

      {showEmptyStats ? (
        <div className="mt-8 flex gap-4 rounded-2xl border border-dashed border-border bg-background/80 px-5 py-6 text-sm text-muted">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Your day is a fresh start</p>
            <p className="mt-1 leading-relaxed">
              When you&apos;re ready, start a short focus block. Your time, breaks, and water nudges
              will show up on this dashboard so you can see progress at a glance.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
