/**
 * Aggregated wellness stats for a calendar day (computed, not a DB row).
 */
export interface DailySummary {
  date: string
  totalFocusMinutes: number
  focusSessionCount: number
  breaksTaken: number
  breaksSkipped: number
  waterRemindersCompleted: number
  stretchSessionsCompleted: number
}
