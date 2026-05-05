import { nowIso } from '../database/timestamps'
import type { ReminderRepository } from '../repositories/reminderRepository'

export function createWaterReminderActions(reminderRepo: ReminderRepository) {
  function assertPendingWater(reminderId: number) {
    const r = reminderRepo.getById(reminderId)
    if (!r || r.type !== 'water' || r.status !== 'pending') {
      throw new Error('Water reminder not found or already handled.')
    }
    return r
  }

  return {
    complete(reminderId: number): void {
      assertPendingWater(reminderId)
      reminderRepo.updateById(reminderId, {
        status: 'completed',
        completedAt: nowIso()
      })
    },

    skip(reminderId: number): void {
      assertPendingWater(reminderId)
      reminderRepo.updateById(reminderId, {
        status: 'skipped',
        completedAt: null
      })
    },

    snooze(reminderId: number): void {
      assertPendingWater(reminderId)
      reminderRepo.updateById(reminderId, {
        status: 'snoozed',
        completedAt: null
      })
    }
  }
}

export type WaterReminderActions = ReturnType<typeof createWaterReminderActions>
