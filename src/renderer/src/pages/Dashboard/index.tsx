export default function Dashboard(): React.JSX.Element {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Good to have you here. Ready to focus?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Focus Timer</p>
          <p className="text-2xl font-bold text-foreground mt-2">—</p>
          <p className="text-xs text-muted mt-1">No active session</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Next Break</p>
          <p className="text-2xl font-bold text-foreground mt-2">—</p>
          <p className="text-xs text-muted mt-1">Start a session first</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Water Reminder</p>
          <p className="text-2xl font-bold text-foreground mt-2">—</p>
          <p className="text-xs text-muted mt-1">Start a session first</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Breaks Today</p>
          <p className="text-2xl font-bold text-foreground mt-2">0</p>
          <p className="text-xs text-muted mt-1">No breaks taken yet</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          Start Focus
        </button>
        <button className="px-5 py-2.5 bg-surface border border-border text-foreground text-sm font-semibold rounded-lg hover:bg-background transition-colors">
          Take a Break
        </button>
      </div>
    </div>
  )
}
