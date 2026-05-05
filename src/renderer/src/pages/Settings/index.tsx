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
  const [allowEmergencyExit, setAllowEmergencyExit] = useState(true)
  const [allowOverlaySnooze, setAllowOverlaySnooze] = useState(true)
  const [showStrictWarning, setShowStrictWarning] = useState(false)
  const [pendingStrictConfirm, setPendingStrictConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  function handleOverlayModeChange(value: OverlayMode): void {
    if (value === 'strict_rest_lock') {
      setShowStrictWarning(true)
      setPendingStrictConfirm(true)
    } else {
      setOverlayMode(value)
    }
  }

  function confirmStrictMode(): void {
    setOverlayMode('strict_rest_lock')
    setShowStrictWarning(false)
    setPendingStrictConfirm(false)
  }

  function cancelStrictMode(): void {
    setShowStrictWarning(false)
    setPendingStrictConfirm(false)
  }

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
    allowEmergencyExit,
    allowOverlaySnooze
  ])

  async function handleReset(): Promise<void> {
    setIsResetting(true)
    try {
      const defaults = await pahingaApi.resetSettingsToDefaults()
      setFocusMinutes(defaults.focusDuration)
      setBreakMinutes(defaults.breakDuration)
      setBreakReminderMinutes(defaults.breakInterval)
      setWaterMinutes(defaults.waterInterval)
      setStretchOn(defaults.stretchRemindersEnabled)
      setNotificationsOn(defaults.notificationsEnabled)
      setStartupOn(defaults.startupEnabled)
      setRestLockEnabled(defaults.restLockModeEnabled)
      setOverlayMode(defaults.overlayMode)
      setAllowEmergencyExit(defaults.allowEmergencyExit)
      setAllowOverlaySnooze(defaults.allowOverlaySnooze)
      await reload()
      showToast('Settings reset to defaults.', 'success')
    } catch {
      showToast('Could not reset settings.', 'error')
    } finally {
      setIsResetting(false)
      setShowResetConfirm(false)
    }
  }

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
                value={pendingStrictConfirm ? 'strict_rest_lock' : overlayMode}
                onChange={(e) => handleOverlayModeChange(e.target.value as OverlayMode)}
              >
                {OVERLAY_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
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

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          disabled={isSaving || !dirty}
          onClick={() => void handleSave()}
          className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? 'Saving…' : 'Save Settings'}
        </button>

        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Reset everything to defaults?</span>
            <button
              type="button"
              disabled={isResetting}
              onClick={() => void handleReset()}
              className="px-3 py-1.5 bg-danger text-white text-xs font-semibold rounded-lg hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isResetting ? 'Resetting…' : 'Yes, reset'}
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-background transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-5 py-2.5 border border-border text-muted text-sm font-medium rounded-lg hover:bg-background hover:text-foreground transition-colors"
          >
            Reset to Defaults
          </button>
        )}
      </div>

      {/* Strict Rest Lock warning modal */}
      {showStrictWarning ? (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">⚠️</span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Enable Strict Rest Lock?</h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  In this mode, the break overlay will actively resist being dismissed. It will:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted list-disc list-inside">
                  <li>Prevent minimizing the overlay window</li>
                  <li>Snap back to focus if you switch apps</li>
                  <li>Hide the Snooze button</li>
                  <li>Require confirmation before Emergency Exit</li>
                </ul>
                <p className="mt-3 text-sm text-warning font-medium">
                  Only enable this if you struggle to take breaks and want stronger enforcement. You can always change it back in Settings.
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={confirmStrictMode}
                className="flex-1 px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-semibold hover:bg-danger/90 transition-colors"
              >
                Enable Strict Mode
              </button>
              <button
                type="button"
                onClick={cancelStrictMode}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
