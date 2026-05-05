import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  Coffee,
  Droplets,
  Layers,
  Leaf,
  RefreshCw,
  SkipForward,
  Timer
} from 'lucide-react'
import type { SummaryResponse } from '@shared/types'
import { DesignCard, ScreenHeader, SmallIconBox } from '@renderer/components/design'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { pahingaApi } from '@renderer/services/pahingaApi'

type DateFilter = 'today' | 'yesterday' | 'last7'

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 days' }
]

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function BigTime({ minutes }: { minutes: number }): React.JSX.Element {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return (
    <div className="flex items-end gap-3">
      <p className="text-[64px] font-bold leading-none tracking-[-0.03em] text-foreground">
        {h || 0}h
      </p>
      <p className="pb-1 text-[30px] font-bold text-muted">{m}m</p>
    </div>
  )
}

function SummaryStat({
  icon,
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
    <DesignCard className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <SmallIconBox icon={icon} tone="beige" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      </div>
      <p className="text-[30px] font-bold leading-none text-foreground">{value}</p>
      <p className="mt-3 text-xs text-muted">{sub}</p>
    </DesignCard>
  )
}

export default function DailySummary(): React.JSX.Element {
  const { showToast } = useToast()
  const [filter, setFilter] = useState<DateFilter>('today')
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (f: DateFilter) => {
      try {
        if (f === 'today') setData(await pahingaApi.summaryGetToday())
        else if (f === 'yesterday') setData(await pahingaApi.summaryGetYesterday())
        else setData(await pahingaApi.summaryGetLastSevenDays())
      } catch (e) {
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
    await load(filter)
    setRefreshing(false)
  }

  const summary = data?.summary

  return (
    <div className="mx-auto max-w-[1016px] px-24 py-10">
      <ScreenHeader
        title="Daily summary"
        description="A simple review of your work and wellness habits."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border bg-surface p-1">
              {DATE_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                    filter === key ? 'bg-primary text-white' : 'text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void onRefresh()}
              className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {!summary ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : (
        <>
          <DesignCard className="mb-5 grid grid-cols-[1fr_1.25fr] p-7">
            <div className="border-r border-border pr-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Total focus time
              </p>
              <BigTime minutes={summary.totalFocusMinutes} />
              <div className="mt-5 h-1 rounded-full bg-[#e7e0d5]">
                <div className="h-full w-[62%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-xs text-muted">62% of daily goal · 2h 40m</p>
            </div>
            <div className="pl-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Today's rhythm
              </p>
              <div className="mt-4 flex h-[104px] items-end justify-around">
                {[0, 72, 72, 0, 72, 72, 0, 72].map((height, i) => (
                  <span key={i} className="w-9 rounded-t-sm bg-primary/70" style={{ height }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted">
                <span>9</span>
                <span>12</span>
                <span>3</span>
                <span>6</span>
                <span>9</span>
              </div>
            </div>
          </DesignCard>

          <div className="grid grid-cols-3 gap-5">
            <SummaryStat
              icon={Timer}
              label="Focus time"
              value={formatMinutes(summary.totalFocusMinutes)}
              sub={`${summary.focusSessionCount} sessions completed`}
            />
            <SummaryStat
              icon={Layers}
              label="Focus sessions"
              value={String(summary.focusSessionCount)}
              sub="Completed blocks"
            />
            <SummaryStat
              icon={Coffee}
              label="Breaks taken"
              value={String(summary.breaksTaken)}
              sub="Completed breaks"
            />
            <SummaryStat
              icon={SkipForward}
              label="Breaks skipped"
              value={String(summary.breaksSkipped)}
              sub="Skipped reminders"
            />
            <SummaryStat
              icon={Droplets}
              label="Water reminders"
              value={String(summary.waterRemindersCompleted)}
              sub="Completed"
            />
            <SummaryStat
              icon={Activity}
              label="Stretches done"
              value={String(summary.stretchSessionsCompleted)}
              sub="Completed"
            />
          </div>

          <div className="mt-5 flex gap-4 rounded-lg border border-primary/20 bg-primary-soft/60 p-5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-white">
              <Leaf className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                A note for today
              </p>
              <p className="mt-1 text-sm text-foreground">{data?.insight}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
