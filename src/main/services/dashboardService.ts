import type { DailySummary } from '../../shared/types'
import type { DashboardToday } from '../../shared/types/dashboard-today'
import { getLocalDayBounds } from '../utils/localDayBounds'
import type { FocusSessionRepository } from '../repositories/focusSessionRepository'
import type { ReminderRepository } from '../repositories/reminderRepository'
import type { StretchLogRepository } from '../repositories/stretchLogRepository'
import type { SettingsService } from './settingsService'
import type { FocusSessionService } from './focusSessionService'

export function createDashboardService(
  settingsService: SettingsService,
  focusRepo: FocusSessionRepository,
  reminderRepo: ReminderRepository,
  stretchRepo: StretchLogRepository,
  focusSessionService: FocusSessionService,
  onFocusTimerCompleted?: () => void
) {
  return {
    getToday(): DashboardToday {
      const { startIso, endExclusiveIso, dateLabel } = getLocalDayBounds()
      const settings = settingsService.get()

      if (focusSessionService.completeDueToTimer()) {
        onFocusTimerCompleted?.()
      }

      const completedToday = focusRepo.listCompletedEndedBetween(startIso, endExclusiveIso)
      const totalFocusMinutes = completedToday.reduce((sum, row) => sum + (row.durationMinutes ?? 0), 0)
      const focusSessionCount = completedToday.length

      const reminders = reminderRepo.listTriggeredBetween(startIso, endExclusiveIso)
      const breaksTaken = reminders.filter((r) => r.type === 'break' && r.status === 'completed').length
      const breaksSkipped = reminders.filter((r) => r.type === 'break' && r.status === 'skipped').length
      const waterRemindersCompleted = reminders.filter(
        (r) => r.type === 'water' && r.status === 'completed'
      ).length

      const stretchSessionsCompleted = stretchRepo.listCompletedBetween(startIso, endExclusiveIso).length

      const summary: DailySummary = {
        date: dateLabel,
        totalFocusMinutes,
        focusSessionCount,
        breaksTaken,
        breaksSkipped,
        waterRemindersCompleted,
        stretchSessionsCompleted
      }

      const activeSession = focusRepo.findActive()
      focusSessionService.syncLiveWithDb()
      const nowMs = Date.now()

      let sessionPhase: DashboardToday['sessionPhase'] = 'idle'
      let focusRemainingSeconds = 0
      let nextBreakInMinutes: number | null = null
      let nextWaterInMinutes: number | null = null

      if (activeSession) {
        const m = focusSessionService.getMetrics(activeSession, nowMs, settings)
        focusRemainingSeconds = m.remainingSec
        nextBreakInMinutes = m.nextBreakInMinutes
        nextWaterInMinutes = m.nextWaterInMinutes
        sessionPhase = m.paused ? 'paused' : 'focusing'
      }

      return {
        settings,
        summary,
        activeSession,
        sessionPhase,
        focusRemainingSeconds,
        nextBreakInMinutes,
        nextWaterInMinutes
      }
    }
  }
}

export type DashboardService = ReturnType<typeof createDashboardService>
