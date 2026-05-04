export default function Settings(): React.JSX.Element {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">Customize your reminders and preferences.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl divide-y divide-border max-w-lg">
        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-foreground mb-4">Focus & Breaks</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Focus Duration</p>
                <p className="text-xs text-muted">Default session length</p>
              </div>
              <select className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background">
                <option>25 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Break Duration</p>
                <p className="text-xs text-muted">How long each break lasts</p>
              </div>
              <select className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background">
                <option>5 minutes</option>
                <option>10 minutes</option>
                <option>15 minutes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-foreground mb-4">Reminders</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Water Reminder</p>
                <p className="text-xs text-muted">Remind me to drink water every</p>
              </div>
              <select className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background">
                <option>60 minutes</option>
                <option>90 minutes</option>
                <option>120 minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Stretch Reminders</p>
                <p className="text-xs text-muted">Include stretch suggestions during breaks</p>
              </div>
              <button className="relative w-10 h-6 rounded-full bg-primary transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Desktop Notifications</p>
                <p className="text-xs text-muted">Show system notifications for reminders</p>
              </div>
              <button className="relative w-10 h-6 rounded-full bg-primary transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Start on System Startup</p>
              <p className="text-xs text-muted">Launch Pahinga when you log in</p>
            </div>
            <button className="relative w-10 h-6 rounded-full bg-border transition-colors">
              <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>
      </div>

      <button className="mt-5 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
        Save Settings
      </button>
    </div>
  )
}
