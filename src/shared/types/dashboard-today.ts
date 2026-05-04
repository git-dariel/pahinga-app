import type { DailySummary } from './daily-summary'
import type { FocusSession } from './focus-session'
import type { UserSettings } from './user-settings'

export type DashboardSessionPhase = 'idle' | 'focusing' | 'paused'

export interface DashboardToday {
  settings: UserSettings
  summary: DailySummary
  activeSession: FocusSession | null
  sessionPhase: DashboardSessionPhase
  /** Seconds left in the current focus block; 0 when idle. */
  focusRemainingSeconds: number
  /** Minutes until the next break reminder boundary while focusing; null when idle. */
  nextBreakInMinutes: number | null
  /** Minutes until the next water reminder boundary while focusing; null when idle. */
  nextWaterInMinutes: number | null
}
