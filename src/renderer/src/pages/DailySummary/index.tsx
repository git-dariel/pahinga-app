import { useCallback, useEffect, useState } from 'react'
import {
  Timer,
  Layers,
  Coffee,
  Droplets,
  Activity,
  SkipForward,
  RefreshCw,
  Lightbulb
} from 'lucide-react'
import type { SummaryResponse } from '@shared/types'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { pahingaApi } from '@renderer/services/pahingaApi'

type DateFilter = 'today' | 'yesterday' | 'last7'

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' }
]

function formatMinutes(minutes: number): string {
  if (minutes === 0) return '0 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub
}: {
  icon: typeof Timer
  label: string
  value: string
  sub: string
}): React.JSX.Element {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
      <p className="text-xs text-muted mt-auto">{sub}</p>
    </div>
  )
}

export default function DailySummary(): React.JSX.Element {
  const { showToast } = useToast()
  const [filter, setFilter] = useState<DateFilter>('today')
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (f: DateFilter, silent = false) => {
      if (!silent) setStatus('loading')
      try {
        let result: SummaryResponse
        if (f === 'today') result = await pahingaApi.summaryGetToday()
        else if (f === 'yesterday') result = await pahingaApi.summaryGetYesterday()
        else result = await pahingaApi.summaryGetLastSevenDays()
        setData(result)
        setStatus('ready')
      } catch (e) {
        setStatus('error')
        showToast(e instanceof Error ? e.message : 'Could not load summary.', 'error')
      }
    },
    [showToast]
  )

  useEffect(() => {
    void load(filter)
  }, [filter, load])

  async function onRefresh(): Promise<void> {
    setRefreshing(true)
    await load(filter, true)
    setRefreshing(false)
  }

  function onFilterChange(f: DateFilter): void {
    setFilter(f)
  }

  const isEmpty =
    data &&
    data.summary.totalFocusMinutes === 0 &&
    data.summary.focusSessionCount === 0 &&
    data.summary.breaksTaken === 0

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Daily Summary</h1>
          <p className="text-sm text-muted mt-1">A simple review of your work and wellness habits.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-xl border border-border overflow-hidden">
            {DATE_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onFilterChange(key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === key
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-foreground hover:bg-background'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            aria-label="Refresh"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted hover:text-foreground hover:border-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {status === 'loading' && !data ? (
        <div className="grid grid-cols-3 gap-4 max-w-2xl mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-border animate-pulse" />
          ))}
        </div>
      ) : null}

      {status === 'ready' || (status === 'loading' && data) ? (
        <>
          {isEmpty ? (
            <div className="bg-surface border border-dashed border-border rounded-xl p-8 max-w-2xl flex flex-col items-center text-center text-muted mb-6">
              <Layers size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium text-foreground">No data yet</p>
              <p className="text-xs mt-1 max-w-xs leading-relaxed">
                {filter === 'today'
                  ? 'Start a focus session to begin tracking your habits for today.'
                  : filter === 'yesterday'
                    ? 'No activity was recorded yesterday.'
                    : 'No activity recorded in the last 7 days.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mb-6">
                <StatCard
                  icon={Timer}
                  label="Focus Time"
                  value={formatMinutes(data!.summary.totalFocusMinutes)}
                  sub={`${data!.summary.focusSessionCount} session${data!.summary.focusSessionCount === 1 ? '' : 's'} completed`}
                />
                <StatCard
                  icon={Layers}
                  label="Focus Sessions"
                  value={String(data!.summary.focusSessionCount)}
                  sub="Completed blocks"
                />
                <StatCard
                  icon={Coffee}
                  label="Breaks Taken"
                  value={String(data!.summary.breaksTaken)}
                  sub="Completed breaks"
                />
                <StatCard
                  icon={SkipForward}
                  label="Breaks Skipped"
                  value={String(data!.summary.breaksSkipped)}
                  sub="Skipped reminders"
                />
                <StatCard
                  icon={Droplets}
                  label="Water Reminders"
                  value={String(data!.summary.waterRemindersCompleted)}
                  sub="Completed"
                />
                <StatCard
                  icon={Activity}
                  label="Stretches Done"
                  value={String(data!.summary.stretchSessionsCompleted)}
                  sub="Completed"
                />
              </div>

              <div className="bg-primary-soft border border-primary/20 rounded-xl p-5 max-w-2xl flex gap-3">
                <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <p className="text-sm text-foreground leading-relaxed">{data!.insight}</p>
              </div>
            </>
          )}
        </>
      ) : null}

      {status === 'error' && !data ? (
        <div className="max-w-2xl">
          <p className="text-sm text-danger mb-4">Could not load summary data.</p>
          <button
            type="button"
            onClick={() => void load(filter)}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  )
}
