import type {
  BreakOverlayOpenReason,
  BreakOverlayTriggerPayload,
  BreakReminderTriggerPayload,
  DashboardToday,
  StretchLog,
  StretchType,
  SummaryResponse,
  UserSettings,
  UserSettingsUpdate,
  WaterReminderTriggerPayload
} from '@shared/types'

function getPahinga(): Window['api']['pahinga'] {
  if (typeof window === 'undefined' || !window.api?.pahinga) {
    throw new Error('Pahinga preload API is not available')
  }
  return window.api.pahinga
}

export const pahingaApi = {
  getSettings(): Promise<UserSettings> {
    return getPahinga().getSettings()
  },

  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings> {
    return getPahinga().updateSettings(patch)
  },

  resetSettingsToDefaults(): Promise<UserSettings> {
    return getPahinga().resetSettingsToDefaults()
  },

  pickOverlayMedia(): Promise<string | null> {
    return getPahinga().pickOverlayMedia()
  },

  isOnboardingComplete(): Promise<boolean> {
    return getPahinga().isOnboardingComplete()
  },

  getDashboardToday(): Promise<DashboardToday> {
    return getPahinga().getDashboardToday()
  },

  sessionStart(payload?: { plannedMinutes?: number }): Promise<DashboardToday> {
    return getPahinga().sessionStart(payload)
  },

  sessionPause(): Promise<DashboardToday> {
    return getPahinga().sessionPause()
  },

  sessionResume(): Promise<DashboardToday> {
    return getPahinga().sessionResume()
  },

  sessionEnd(): Promise<DashboardToday> {
    return getPahinga().sessionEnd()
  },

  sessionCancel(): Promise<DashboardToday> {
    const pahinga = getPahinga() as {
      sessionCancel?: () => Promise<DashboardToday>
      sessionEnd?: ((completed: boolean) => Promise<DashboardToday>) | (() => Promise<DashboardToday>)
    }
    if (typeof pahinga.sessionCancel === 'function') {
      return pahinga.sessionCancel()
    }
    const end = pahinga.sessionEnd
    if (typeof end === 'function' && end.length >= 1) {
      return (end as (completed: boolean) => Promise<DashboardToday>)(false)
    }
    throw new Error(
      'Session API is out of date. Quit the app completely (all windows), then start it again with pnpm dev.'
    )
  },

  sessionSkip(): Promise<DashboardToday> {
    return getPahinga().sessionSkip()
  },

  reminderComplete(reminderId: number): Promise<DashboardToday> {
    return getPahinga().reminderComplete(reminderId)
  },

  reminderSnooze(reminderId: number): Promise<DashboardToday> {
    return getPahinga().reminderSnooze(reminderId)
  },

  reminderSkip(reminderId: number): Promise<DashboardToday> {
    return getPahinga().reminderSkip(reminderId)
  },

  onBreakReminderTrigger(callback: (payload: BreakReminderTriggerPayload) => void): () => void {
    return getPahinga().onBreakReminderTrigger(callback)
  },

  waterReminderComplete(reminderId: number): Promise<DashboardToday> {
    return getPahinga().waterReminderComplete(reminderId)
  },

  waterReminderSnooze(reminderId: number): Promise<DashboardToday> {
    return getPahinga().waterReminderSnooze(reminderId)
  },

  waterReminderSkip(reminderId: number): Promise<DashboardToday> {
    return getPahinga().waterReminderSkip(reminderId)
  },

  onWaterReminderTrigger(callback: (payload: WaterReminderTriggerPayload) => void): () => void {
    return getPahinga().onWaterReminderTrigger(callback)
  },

  stretchComplete(stretchType: StretchType, durationSeconds: number): Promise<StretchLog> {
    return getPahinga().stretchComplete(stretchType, durationSeconds)
  },

  stretchGetToday(): Promise<StretchLog[]> {
    return getPahinga().stretchGetToday()
  },

  summaryGetToday(): Promise<SummaryResponse> {
    return getPahinga().summaryGetToday()
  },

  summaryGetYesterday(): Promise<SummaryResponse> {
    return getPahinga().summaryGetYesterday()
  },

  summaryGetLastSevenDays(): Promise<SummaryResponse> {
    return getPahinga().summaryGetLastSevenDays()
  },

  overlayOpenBreak(reason: BreakOverlayOpenReason): Promise<BreakOverlayTriggerPayload> {
    return getPahinga().overlayOpenBreak(reason)
  },

  overlayCloseBreak(): Promise<boolean> {
    return getPahinga().overlayCloseBreak()
  },

  overlayStartBreak(reminderId: number): Promise<boolean> {
    return getPahinga().overlayStartBreak(reminderId)
  },

  overlaySnoozeBreak(reminderId: number): Promise<DashboardToday> {
    return getPahinga().overlaySnoozeBreak(reminderId)
  },

  overlayEmergencyExit(reminderId: number): Promise<DashboardToday> {
    return getPahinga().overlayEmergencyExit(reminderId)
  },

  overlayCompleteBreak(reminderId: number): Promise<DashboardToday> {
    return getPahinga().overlayCompleteBreak(reminderId)
  },

  onOverlayBreakTriggered(callback: (payload: BreakOverlayTriggerPayload) => void): () => void {
    return getPahinga().onOverlayBreakTriggered(callback)
  },

  getBreakOverlayPayload(): Promise<BreakOverlayTriggerPayload | null> {
    return getPahinga().getBreakOverlayPayload()
  },

  getNekoUrls(): Promise<{ intro: string; loop: string }> {
    return getPahinga().getNekoUrls()
  }
}
