import { nowIso } from '../database/timestamps'
import { getLocalDayBounds } from '../utils/localDayBounds'
import type { StretchLogRepository } from '../repositories/stretchLogRepository'
import type { StretchLog, StretchType } from '../../shared/types'

export function createStretchService(stretchRepo: StretchLogRepository) {
  return {
    complete(stretchType: StretchType, durationSeconds: number): StretchLog {
      return stretchRepo.create({
        stretchType,
        durationSeconds,
        completedAt: nowIso()
      })
    },

    getToday(): StretchLog[] {
      const { startIso, endExclusiveIso } = getLocalDayBounds()
      return stretchRepo.listCompletedBetween(startIso, endExclusiveIso)
    }
  }
}

export type StretchService = ReturnType<typeof createStretchService>
