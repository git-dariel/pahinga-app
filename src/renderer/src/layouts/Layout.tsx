import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Activity,
  BarChart2,
  Eye,
  LayoutDashboard,
  Maximize2,
  Minus,
  Settings,
  Timer,
  X
} from 'lucide-react'
import type {
  AppInfo,
  BreakReminderTriggerPayload,
  WaterReminderTriggerPayload
} from '@shared/types'
import { BreakReminderModal } from '@renderer/components/BreakReminderModal'
import { WaterReminderModal } from '@renderer/components/WaterReminderModal'
import { cn } from '@renderer/lib/cn'
import { pahingaApi } from '@renderer/services/pahingaApi'
import appIcon from '../../../../resources/icon.png'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/focus', label: 'Focus Timer', icon: Timer },
  { to: '/stretch', label: 'Stretch Guide', icon: Activity },
  { to: '/summary', label: 'Daily Summary', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings }
]

function AppTitleBar(): React.JSX.Element {
  return (
    <div className="app-drag flex h-9 shrink-0 items-center justify-between bg-[#13241b] px-3 text-[#dfe8df]">
      <div className="flex items-center gap-2">
        <img src={appIcon} alt="Pahinga logo" className="h-4 w-4 object-contain" />
        <p className="text-xs font-semibold text-white/70">Pahinga</p>
      </div>
      <div className="app-no-drag flex items-center gap-5 text-white/70">
        <Eye className="h-3.5 w-3.5" aria-hidden />
        <button
          type="button"
          onClick={() => void pahingaApi.windowMinimize()}
          aria-label="Minimize"
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => void pahingaApi.windowMaximize()}
          aria-label="Maximize"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button type="button" onClick={() => void pahingaApi.windowClose()} aria-label="Close">
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default function Layout(): React.JSX.Element {
  const [breakReminder, setBreakReminder] = useState<BreakReminderTriggerPayload | null>(null)
  const [waterReminder, setWaterReminder] = useState<WaterReminderTriggerPayload | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    return pahingaApi.onBreakReminderTrigger((payload) => setBreakReminder(payload))
  }, [])

  useEffect(() => {
    return pahingaApi.onWaterReminderTrigger((payload) => setWaterReminder(payload))
  }, [])

  useEffect(() => {
    let mounted = true
    void pahingaApi
      .getAppInfo()
      .then((info) => {
        if (mounted) setAppInfo(info)
      })
      .catch(() => {
        if (mounted) setAppInfo(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppTitleBar />
      <div className="flex min-h-0 flex-1">
        <aside className="relative flex w-16 shrink-0 flex-col items-center border-r border-border/70 bg-[#fbfaf6] py-5">
          <div className="mb-7 grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-primary-soft">
            <img src={appIcon} alt="Pahinga logo" className="h-6 w-6 object-contain" />
          </div>

          <nav className="flex flex-1 flex-col items-center gap-3">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                title={label}
                className={({ isActive }) =>
                  cn(
                    'relative grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-primary-soft hover:text-primary',
                    isActive && 'bg-primary-soft text-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-primary" />
                    ) : null}
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-2 rounded-full bg-primary-soft px-3 py-2 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="sr-only">v{appInfo?.version ?? '0.1.0'}</span>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>

      <BreakReminderModal payload={breakReminder} onDismiss={() => setBreakReminder(null)} />
      <WaterReminderModal payload={waterReminder} onDismiss={() => setWaterReminder(null)} />
    </div>
  )
}
