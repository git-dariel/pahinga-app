export type FocusSessionStatus = 'in_progress' | 'completed' | 'skipped' | 'cancelled'

export interface FocusSession {
  id: number
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  status: FocusSessionStatus
  /** Planned focus length (minutes); null means use current settings default. */
  targetMinutes: number | null
}

export interface FocusSessionInsert {
  /** Defaults to current time (ISO) when omitted. */
  startedAt?: string
  status?: FocusSessionStatus
  /** When set, timer counts down this many minutes; otherwise settings default at start time. */
  targetMinutes?: number | null
}

export type FocusSessionUpdate = Partial<
  Pick<FocusSession, 'endedAt' | 'durationMinutes' | 'status'>
>
