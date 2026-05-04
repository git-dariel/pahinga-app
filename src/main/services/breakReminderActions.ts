import { nowIso } from '../database/timestamps'
import type { ReminderRepository } from '../repositories/reminderRepository'

export function createBreakReminderActions(reminderRepo: ReminderRepository) {
  function assertPendingBreak(reminderId: number) {
    const r = reminderRepo.getById(reminderId)
    if (!r || r.type !== 'break' || r.status !== 'pending') {
      throw new Error('Break reminder not found or already handled.')
    }
    return r
  }

  return {
    complete(reminderId: number): void {
      assertPendingBreak(reminderId)
      reminderRepo.updateById(reminderId, {
        status: 'completed',
        completedAt: nowIso()
      })
    },

    skip(reminderId: number): void {
      assertPendingBreak(reminderId)
      reminderRepo.updateById(reminderId, {
        status: 'skipped',
        completedAt: null
      })
    },

    snooze(reminderId: number): void {
      assertPendingBreak(reminderId)
      reminderRepo.updateById(reminderId, {
        status: 'snoozed',
        completedAt: null
      })
    }
  }
}

export type BreakReminderActions = ReturnType<typeof createBreakReminderActions>
