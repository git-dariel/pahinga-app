import type { DailySummary } from './daily-summary'

/** Returned by summary IPC handlers — includes computed insight text. */
export interface SummaryResponse {
  summary: DailySummary
  insight: string
}
