export type ReminderType = 'break' | 'water' | 'stretch' | 'eye_rest'

export type ReminderStatus = 'pending' | 'completed' | 'snoozed' | 'skipped' | 'emergency_exit'

export interface Reminder {
  id: number
  type: ReminderType
  triggeredAt: string
  completedAt: string | null
  status: ReminderStatus
}

export interface ReminderInsert {
  type: ReminderType
  triggeredAt: string
  status?: ReminderStatus
}

export type ReminderUpdate = Partial<Pick<Reminder, 'completedAt' | 'status'>>
