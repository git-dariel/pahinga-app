export type FocusSessionStatus = 'in_progress' | 'completed' | 'skipped' | 'cancelled'

export interface FocusSession {
  id: number
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  status: FocusSessionStatus
}

export interface FocusSessionInsert {
  /** Defaults to current time (ISO) when omitted. */
  startedAt?: string
  status?: FocusSessionStatus
}

export type FocusSessionUpdate = Partial<
  Pick<FocusSession, 'endedAt' | 'durationMinutes' | 'status'>
>
