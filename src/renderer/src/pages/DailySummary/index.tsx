const stats = [
  { label: 'Total Focus Time', value: '—', unit: '' },
  { label: 'Focus Sessions', value: '0', unit: 'sessions' },
  { label: 'Breaks Taken', value: '0', unit: 'breaks' },
  { label: 'Breaks Skipped', value: '0', unit: 'skipped' },
  { label: 'Water Reminders', value: '0', unit: 'completed' },
  { label: 'Stretches Done', value: '0', unit: 'completed' }
]

export default function DailySummary(): React.JSX.Element {
  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Summary</h1>
          <p className="text-sm text-muted mt-1">A simple review of your work and wellness habits.</p>
        </div>

        <div className="flex gap-2">
          {['Today', 'Yesterday', 'Last 7 Days'].map((label) => (
            <button
              key={label}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted hover:text-foreground hover:border-primary transition-colors first:bg-primary-soft first:text-primary first:border-primary"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mb-6">
        {stats.map(({ label, value, unit }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            {unit && <p className="text-xs text-muted mt-1">{unit}</p>}
          </div>
        ))}
      </div>

      <div className="bg-primary-soft border border-primary/20 rounded-xl p-5 max-w-2xl">
        <p className="text-sm font-medium text-foreground">
          No data yet for today. Start a focus session to begin tracking your habits.
        </p>
      </div>
    </div>
  )
}
