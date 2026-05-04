import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Timer, Activity, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/focus', label: 'Focus Timer', icon: Timer },
  { to: '/stretch', label: 'Stretch Guide', icon: Activity },
  { to: '/summary', label: 'Daily Summary', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings }
]

export default function Layout(): React.JSX.Element {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-60 flex flex-col bg-surface border-r border-border shrink-0">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Pahinga</h1>
          <p className="text-xs text-muted mt-0.5">Work well. Rest well.</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted hover:text-foreground hover:bg-background'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs text-muted">v0.1.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
