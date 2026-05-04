export default function FocusTimer(): React.JSX.Element {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Focus Timer</h1>
        <p className="text-sm text-muted mt-1">Work in focused sessions with intentional breaks.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-10 max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
            Focus Session
          </p>
          <p className="text-7xl font-bold text-foreground tabular-nums">25:00</p>
        </div>

        <div className="flex gap-2">
          {[25, 45, 60].map((min) => (
            <button
              key={min}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-border text-muted hover:text-foreground hover:border-primary transition-colors"
            >
              {min}m
            </button>
          ))}
        </div>

        <button className="w-full px-5 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          Start Focus
        </button>
      </div>
    </div>
  )
}
