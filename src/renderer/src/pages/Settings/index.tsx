import { useEffect, useMemo, useState } from 'react'
import {
  BREAK_DURATION_OPTIONS,
  BREAK_REMINDER_OPTIONS,
  FOCUS_DURATION_OPTIONS,
  WATER_REMINDER_OPTIONS
} from '@shared/reminderIntervals'
import type { DesktopNotificationStatus, NotificationPreviewKind, OverlayMode } from '@shared/types'
import { DesignButton, DesignCard, Pill, ScreenHeader } from '@renderer/components/design'
import { Toggle } from '@renderer/components/ui'
import { useToast } from '@renderer/components/Toast/ToastProvider'
import { useUserSettings } from '@renderer/hooks/useUserSettings'
import { pahingaApi } from '@renderer/services/pahingaApi'

function optionsWithValue(fixed: readonly number[], value: number): number[] {
  const set = new Set<number>(fixed)
  set.add(value)
  return [...set].sort((a, b) => a - b)
}

function SettingSelect({
  value,
  options,
  onChange
}: {
  value: number
  options: number[]
  onChange: (next: number) => void
}): React.JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-8 min-w-[140px] rounded-md border border-border bg-surface px-3 text-xs font-semibold text-foreground outline-none"
    >
      {options.map((m) => (
        <option key={m} value={m}>
          {m} minutes
        </option>
      ))}
    </select>
  )
}

function SettingModeSelect({
  value,
  onChange
}: {
  value: OverlayMode
  onChange: (next: OverlayMode) => void
}): React.JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OverlayMode)}
      className="h-8 min-w-[220px] rounded-md border border-border bg-surface px-3 text-xs font-semibold text-foreground outline-none"
    >
      <option value="focused_break_overlay">Focused break overlay</option>
      <option value="strict_rest_lock">Strict rest lock</option>
      <option value="soft_reminder">Soft reminder</option>
    </select>
  )
}

function SettingRow({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex min-h-[66px] items-center justify-between gap-6 border-b border-border px-5 last:border-b-0">
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      {children}
    </div>
  )
}

function SettingsSection({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted">{description}</p>
      <DesignCard className="mt-3 overflow-hidden">{children}</DesignCard>
    </section>
  )
}

export default function Settings(): React.JSX.Element {
  const { data, status, save, reload } = useUserSettings()
  const { showToast } = useToast()
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [breakReminderMinutes, setBreakReminderMinutes] = useState(25)
  const [waterMinutes, setWaterMinutes] = useState(60)
  const [stretchOn, setStretchOn] = useState(true)
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [startupOn, setStartupOn] = useState(false)
  const [restLockModeOn, setRestLockModeOn] = useState(false)
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('focused_break_overlay')
  const [allowOverlaySnooze, setAllowOverlaySnooze] = useState(true)
  const [allowEmergencyExit, setAllowEmergencyExit] = useState(true)
  const [notificationStatus, setNotificationStatus] = useState<DesktopNotificationStatus | null>(
    null
  )
  const [previewingNotification, setPreviewingNotification] =
    useState<NotificationPreviewKind | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!data) return
    setFocusMinutes(data.focusDuration)
    setBreakMinutes(data.breakDuration)
    setBreakReminderMinutes(data.breakInterval)
    setWaterMinutes(data.waterInterval)
    setStretchOn(data.stretchRemindersEnabled)
    setNotificationsOn(data.notificationsEnabled)
    setStartupOn(data.startupEnabled)
    setRestLockModeOn(data.restLockModeEnabled)
    setOverlayMode(data.overlayMode)
    setAllowOverlaySnooze(data.allowOverlaySnooze)
    setAllowEmergencyExit(data.allowEmergencyExit)
  }, [data])

  useEffect(() => {
    let mounted = true
    void pahingaApi
      .getNotificationStatus()
      .then((next) => {
        if (mounted) setNotificationStatus(next)
      })
      .catch(() => {
        if (mounted) setNotificationStatus(null)
      })
    return () => {
      mounted = false
    }
  }, [])

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
      restLockModeOn !== data.restLockModeEnabled ||
      overlayMode !== data.overlayMode ||
      allowOverlaySnooze !== data.allowOverlaySnooze ||
      allowEmergencyExit !== data.allowEmergencyExit
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
    restLockModeOn,
    overlayMode,
    allowOverlaySnooze,
    allowEmergencyExit
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
        restLockModeEnabled: restLockModeOn,
        overlayMode,
        allowOverlaySnooze,
        allowEmergencyExit
      })
      setNotificationStatus(await pahingaApi.getNotificationStatus())
      showToast('Settings saved successfully.', 'success')
    } catch {
      showToast('Could not save settings.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleResetToDefaults(): Promise<void> {
    if (!window.confirm('Reset all settings to defaults? This cannot be undone.')) return
    setIsSaving(true)
    try {
      await pahingaApi.resetSettingsToDefaults()
      await reload()
      setNotificationStatus(await pahingaApi.getNotificationStatus())
      showToast('Settings reset to defaults.', 'success')
    } catch {
      showToast('Could not reset settings.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePreviewNotification(kind: NotificationPreviewKind): Promise<void> {
    setPreviewingNotification(kind)
    try {
      const shown = await pahingaApi.previewNotification(kind)
      showToast(
        shown ? 'Preview notification sent.' : 'Desktop notifications are not ready.',
        shown ? 'success' : 'error'
      )
    } catch {
      showToast('Could not send preview notification.', 'error')
    } finally {
      setPreviewingNotification(null)
    }
  }

  if (status === 'loading' && !data) {
    return <div className="mx-auto max-w-[696px] px-8 py-10 text-sm text-muted">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-[696px] px-8 py-10">
      <ScreenHeader title="Settings" description="Customize your reminders and preferences." />

      <SettingsSection title="Focus & breaks" description="The shape of your work rhythm.">
        <SettingRow title="Focus duration" description="Default session length">
          <SettingSelect
            value={focusMinutes}
            options={optionsWithValue(FOCUS_DURATION_OPTIONS, focusMinutes)}
            onChange={setFocusMinutes}
          />
        </SettingRow>
        <SettingRow title="Break duration" description="How long each break lasts">
          <SettingSelect
            value={breakMinutes}
            options={optionsWithValue(BREAK_DURATION_OPTIONS, breakMinutes)}
            onChange={setBreakMinutes}
          />
        </SettingRow>
        <SettingRow title="Break reminder interval" description="How often to remind you">
          <SettingSelect
            value={breakReminderMinutes}
            options={optionsWithValue(BREAK_REMINDER_OPTIONS, breakReminderMinutes)}
            onChange={setBreakReminderMinutes}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Break overlay" description="What happens when it's time to rest.">
        <SettingRow title="Enable rest-lock mode" description="Show always-on-top break overlay">
          <Toggle
            pressed={restLockModeOn}
            onPressedChange={setRestLockModeOn}
            label="Enable rest-lock mode"
          />
        </SettingRow>
        <SettingRow title="Overlay mode" description="Focused break overlay is recommended">
          <SettingModeSelect value={overlayMode} onChange={setOverlayMode} />
        </SettingRow>
        <SettingRow title="Allow snooze in overlay" description="Snooze 5 minutes from the overlay">
          <Toggle
            pressed={allowOverlaySnooze}
            onPressedChange={setAllowOverlaySnooze}
            label="Allow snooze in overlay"
          />
        </SettingRow>
        <SettingRow
          title="Allow emergency exit"
          description="Keep a safe way out always available"
        >
          <Toggle
            pressed={allowEmergencyExit}
            onPressedChange={setAllowEmergencyExit}
            label="Allow emergency exit"
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Reminders" description="Gentle nudges throughout your day.">
        <SettingRow title="Water reminder" description="Remind me to drink water every">
          <SettingSelect
            value={waterMinutes}
            options={optionsWithValue(WATER_REMINDER_OPTIONS, waterMinutes)}
            onChange={setWaterMinutes}
          />
        </SettingRow>
        <SettingRow title="Stretch reminders" description="Include stretches during breaks">
          <Toggle pressed={stretchOn} onPressedChange={setStretchOn} label="Stretch reminders" />
        </SettingRow>
        <SettingRow title="Desktop notifications" description="Show system notifications">
          <Toggle
            pressed={notificationsOn}
            onPressedChange={setNotificationsOn}
            label="Desktop notifications"
          />
        </SettingRow>
        <div className="m-5 rounded-md border border-border bg-background/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-foreground">Reminder preview</p>
              <p className="mt-0.5 text-xs text-muted">Send a sample notification.</p>
            </div>
            <Pill className="px-3 py-1 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {notificationStatus?.permissionStatus === 'ready' ? 'Ready' : 'Off'}
            </Pill>
          </div>
          <div className="mt-3 flex gap-2">
            <DesignButton
              type="button"
              disabled={
                previewingNotification !== null || notificationStatus?.permissionStatus !== 'ready'
              }
              onClick={() => void handlePreviewNotification('break')}
            >
              Preview break
            </DesignButton>
            <DesignButton
              type="button"
              disabled={
                previewingNotification !== null || notificationStatus?.permissionStatus !== 'ready'
              }
              onClick={() => void handlePreviewNotification('water')}
            >
              Preview water
            </DesignButton>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="App" description="Launch and background behavior.">
        <SettingRow title="Start on system startup" description="Launch Pahinga when you log in">
          <Toggle
            pressed={startupOn}
            onPressedChange={setStartupOn}
            label="Start on system startup"
          />
        </SettingRow>
      </SettingsSection>

      <div className="mt-6 flex items-center justify-between">
        <DesignButton type="button" disabled={isSaving} onClick={() => void handleResetToDefaults()}>
          Reset to defaults
        </DesignButton>
        <DesignButton
          type="button"
          variant="primary"
          disabled={!dirty || isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving ? 'Saving...' : 'Save settings'}
        </DesignButton>
      </div>
    </div>
  )
}
