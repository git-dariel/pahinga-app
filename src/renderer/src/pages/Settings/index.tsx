import { useEffect, useMemo, useState } from 'react'
import {
  BREAK_DURATION_OPTIONS,
  BREAK_REMINDER_OPTIONS,
  FOCUS_DURATION_OPTIONS,
  WATER_REMINDER_OPTIONS
} from '@shared/reminderIntervals'
import type { OverlayMode } from '@shared/types/user-settings'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { useUserSettings } from '@renderer/hooks/useUserSettings'
import { pahingaApi } from '@renderer/services/pahingaApi'

function optionsWithValue(fixed: readonly number[], value: number): number[] {
  const set = new Set<number>(fixed)
  set.add(value)
  return [...set].sort((a, b) => a - b)
}

const OVERLAY_MODES = [
  { value: 'soft_reminder', label: 'Soft Reminder' },
  { value: 'focused_break_overlay', label: 'Focused Break Overlay' },
  { value: 'strict_rest_lock', label: 'Strict Rest Lock' }
] as const

function Toggle({
  pressed,
  onPressedChange,
  label
}: {
  pressed: boolean
  onPressedChange: (next: boolean) => void
  label: string
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      onClick={() => onPressedChange(!pressed)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        pressed ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
          pressed ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  )
}

export default function Settings(): React.JSX.Element {
  const { data, status, error, reload, save } = useUserSettings()
  const { showToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [focusMinutes, setFocusMinutes] = useState<number>(25)
  const [breakMinutes, setBreakMinutes] = useState<number>(5)
  const [breakReminderMinutes, setBreakReminderMinutes] = useState<number>(25)
  const [waterMinutes, setWaterMinutes] = useState<number>(60)
  const [stretchOn, setStretchOn] = useState(true)
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [startupOn, setStartupOn] = useState(false)
  const [restLockEnabled, setRestLockEnabled] = useState(false)
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('soft_reminder')
  const [overlayMediaPath, setOverlayMediaPath] = useState('')
  const [allowEmergencyExit, setAllowEmergencyExit] = useState(true)
  const [allowOverlaySnooze, setAllowOverlaySnooze] = useState(true)

  useEffect(() => {
    if (!data) return
    setFocusMinutes(data.focusDuration)
    setBreakMinutes(data.breakDuration)
    setBreakReminderMinutes(data.breakInterval)
    setWaterMinutes(data.waterInterval)
    setStretchOn(data.stretchRemindersEnabled)
    setNotificationsOn(data.notificationsEnabled)
    setStartupOn(data.startupEnabled)
    setRestLockEnabled(data.restLockModeEnabled)
    setOverlayMode(data.overlayMode)
    setOverlayMediaPath(data.overlayMediaPath ?? '')
    setAllowEmergencyExit(data.allowEmergencyExit)
    setAllowOverlaySnooze(data.allowOverlaySnooze)
  }, [data])

  const isLoading = status === 'loading' && !data
  const loadFailed = status === 'error'

  const dirty = useMemo(() => {
    if (!data) return false
    return (
      focusMinutes !== data.focusDuration ||
      breakMinutes !== data.breakDuration ||
      breakReminderMinutes !== data.breakInterval ||
      waterMinutes !== data.waterInterval ||
      stretchOn !== data.stretchRemindersEnabled ||
      notificationsOn !== data.notificationsEnabled ||
      startupOn !== data.startupEnabled ||
      restLockEnabled !== data.restLockModeEnabled ||
      overlayMode !== data.overlayMode ||
      overlayMediaPath !== (data.overlayMediaPath ?? '') ||
      allowEmergencyExit !== data.allowEmergencyExit ||
      allowOverlaySnooze !== data.allowOverlaySnooze
    )
  }, [
    data,
    focusMinutes,
    breakMinutes,
    breakReminderMinutes,
    waterMinutes,
    stretchOn,
    notificationsOn,
    startupOn,
    restLockEnabled,
    overlayMode,
    overlayMediaPath,
    allowEmergencyExit,
    allowOverlaySnooze
  ])

  async function handleSave(): Promise<void> {
    setIsSaving(true)
    try {
      await save({
        focusDuration: focusMinutes,
        breakDuration: breakMinutes,
        breakInterval: breakReminderMinutes,
        waterInterval: waterMinutes,
        stretchRemindersEnabled: stretchOn,
        notificationsEnabled: notificationsOn,
        startupEnabled: startupOn,
        restLockModeEnabled: restLockEnabled,
        overlayMode,
        overlayMediaPath: overlayMediaPath.trim(),
        allowEmergencyExit,
        allowOverlaySnooze
      })
      showToast('Settings saved successfully.', 'success')
    } catch {
      showToast('Could not save settings.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted mt-1">Loading your preferences…</p>
        </div>
        <div className="h-40 max-w-lg rounded-xl border border-border bg-surface animate-pulse" />
      </div>
    )
  }

  if (loadFailed && !data) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted mt-1">Customize your reminders and preferences.</p>
        </div>
        <div className="max-w-lg rounded-xl border border-danger/30 bg-surface px-5 py-4 text-sm text-danger">
          <p className="font-semibold">Could not load settings</p>
          <p className="mt-1 text-muted">{error?.message ?? 'Unknown error'}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">Customize your reminders and preferences.</p>
      </div>

      {error && data ? (
        <div className="mb-4 max-w-lg rounded-lg border border-warning/40 bg-surface px-4 py-3 text-sm text-warning">
          {error.message}
        </div>
      ) : null}

      <div className="bg-surface border border-border rounded-xl divide-y divide-border max-w-lg">
        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-foreground mb-4">Focus & Breaks</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Focus Duration</p>
                <p className="text-xs text-muted">Default session length</p>
              </div>
              <select
                className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background min-w-36"
                value={focusMinutes}
                onChange={(e) => setFocusMinutes(Number(e.target.value))}
              >
                {optionsWithValue(FOCUS_DURATION_OPTIONS, data?.focusDuration ?? focusMinutes).map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Break Duration</p>
                <p className="text-xs text-muted">How long each break lasts</p>
              </div>
              <select
                className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background min-w-36"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
              >
                {optionsWithValue(BREAK_DURATION_OPTIONS, data?.breakDuration ?? breakMinutes).map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Break Reminder Interval</p>
                <p className="text-xs text-muted">How often to remind you to take a break</p>
              </div>
              <select
                className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background min-w-36"
                value={breakReminderMinutes}
                onChange={(e) => setBreakReminderMinutes(Number(e.target.value))}
              >
                {optionsWithValue(
                  BREAK_REMINDER_OPTIONS,
                  data?.breakInterval ?? breakReminderMinutes
                ).map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-foreground mb-4">Reminders</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Water Reminder</p>
                <p className="text-xs text-muted">Remind me to drink water every</p>
              </div>
              <select
                className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background min-w-36"
                value={waterMinutes}
                onChange={(e) => setWaterMinutes(Number(e.target.value))}
              >
                {optionsWithValue(WATER_REMINDER_OPTIONS, data?.waterInterval ?? waterMinutes).map((m) => (
                  <option key={m} value={m}>
                    {m} minutes
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Stretch Reminders</p>
                <p className="text-xs text-muted">Include stretch suggestions during breaks</p>
              </div>
              <Toggle pressed={stretchOn} onPressedChange={setStretchOn} label="Stretch reminders" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Desktop Notifications</p>
                <p className="text-xs text-muted">Show system notifications for reminders</p>
              </div>
              <Toggle
                pressed={notificationsOn}
                onPressedChange={setNotificationsOn}
                label="Desktop notifications"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Start on System Startup</p>
              <p className="text-xs text-muted">Launch Pahinga when you log in</p>
            </div>
            <Toggle pressed={startupOn} onPressedChange={setStartupOn} label="Start on system startup" />
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-foreground mb-4">Break Overlay / Rest Lock</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Rest Lock Mode</p>
                <p className="text-xs text-muted">Show an always-on-top break overlay instead of only small reminders</p>
              </div>
              <Toggle
                pressed={restLockEnabled}
                onPressedChange={setRestLockEnabled}
                label="Enable rest lock mode"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Overlay Mode</p>
                <p className="text-xs text-muted">Focused Break Overlay is recommended for MVP</p>
              </div>
              <select
                className="text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background min-w-44"
                value={overlayMode}
                onChange={(e) => setOverlayMode(e.target.value as OverlayMode)}
              >
                {OVERLAY_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Overlay media (GIF or MP4)</p>
                <p className="text-xs text-muted">
                  Choose a file from your computer, or paste a path. Leave empty for the default illustration.
                </p>
                <input
                  type="text"
                  value={overlayMediaPath}
                  onChange={(e) => setOverlayMediaPath(e.target.value)}
                  placeholder="No file selected"
                  className="mt-2 w-full max-w-md text-sm border border-border rounded-lg px-3 py-1.5 text-foreground bg-background"
                />
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void (async () => {
                      try {
                        const picked = await pahingaApi.pickOverlayMedia()
                        if (picked) setOverlayMediaPath(picked)
                      } catch {
                        showToast('Could not open file picker.', 'error')
                      }
                    })()
                  }
                  className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-background"
                >
                  Choose file…
                </button>
                <button
                  type="button"
                  onClick={() => setOverlayMediaPath('')}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-background"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Allow Snooze in Overlay</p>
                <p className="text-xs text-muted">Lets users snooze 5 minutes from the overlay screen</p>
              </div>
              <Toggle
                pressed={allowOverlaySnooze}
                onPressedChange={setAllowOverlaySnooze}
                label="Allow overlay snooze"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Allow Emergency Exit</p>
                <p className="text-xs text-muted">Keeps a safe way out available to avoid trapping users</p>
              </div>
              <Toggle
                pressed={allowEmergencyExit}
                onPressedChange={setAllowEmergencyExit}
                label="Allow emergency exit"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={isSaving || !dirty}
        onClick={() => void handleSave()}
        className="mt-5 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSaving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
