import { getLocalDayBounds } from '../utils/localDayBounds'
import type { FocusSessionRepository } from '../repositories/focusSessionRepository'
import type { ReminderRepository } from '../repositories/reminderRepository'
import type { StretchLogRepository } from '../repositories/stretchLogRepository'
import type { DailySummary } from '../../shared/types'
import type { SummaryResponse } from '../../shared/types/summary-response'

function buildSummary(
  dateLabel: string,
  startIso: string,
  endExclusiveIso: string,
  focusRepo: FocusSessionRepository,
  reminderRepo: ReminderRepository,
  stretchRepo: StretchLogRepository
): DailySummary {
  const completedSessions = focusRepo.listCompletedEndedBetween(startIso, endExclusiveIso)
  const totalFocusMinutes = completedSessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0)
  const focusSessionCount = completedSessions.length

  const reminders = reminderRepo.listTriggeredBetween(startIso, endExclusiveIso)
  const breaksTaken = reminders.filter((r) => r.type === 'break' && r.status === 'completed').length
  const breaksSkipped = reminders.filter((r) => r.type === 'break' && r.status === 'skipped').length
  const waterRemindersCompleted = reminders.filter(
    (r) => r.type === 'water' && r.status === 'completed'
  ).length

  const stretchSessionsCompleted = stretchRepo.listCompletedBetween(startIso, endExclusiveIso).length

  return {
    date: dateLabel,
    totalFocusMinutes,
    focusSessionCount,
    breaksTaken,
    breaksSkipped,
    waterRemindersCompleted,
    stretchSessionsCompleted
  }
}

function generateInsight(summary: DailySummary): string {
  const { totalFocusMinutes, breaksTaken, breaksSkipped, waterRemindersCompleted, stretchSessionsCompleted } =
    summary

  if (totalFocusMinutes === 0) {
    return 'No focus sessions recorded yet. Start a focus session to begin tracking your habits.'
  }

  const hours = Math.floor(totalFocusMinutes / 60)
  const mins = totalFocusMinutes % 60
  const timeLabel = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`

  const parts: string[] = []

  if (breaksTaken > 0 && breaksTaken >= breaksSkipped) {
    parts.push(
      `You worked for ${timeLabel} and took ${breaksTaken} break${breaksTaken === 1 ? '' : 's'}. Good job keeping a healthier work rhythm.`
    )
  } else if (breaksSkipped > breaksTaken) {
    parts.push(
      `You worked for ${timeLabel} but skipped most breaks. Try taking short breaks tomorrow to avoid fatigue.`
    )
  } else {
    parts.push(`You worked for ${timeLabel} today.`)
  }

  if (waterRemindersCompleted > 0) {
    parts.push(
      `You stayed hydrated with ${waterRemindersCompleted} water reminder${waterRemindersCompleted === 1 ? '' : 's'} completed.`
    )
  }

  if (stretchSessionsCompleted > 0) {
    parts.push(
      `You stretched ${stretchSessionsCompleted} time${stretchSessionsCompleted === 1 ? '' : 's'} — great for your body.`
    )
  }

  return parts.join(' ')
}

export function createSummaryService(
  focusRepo: FocusSessionRepository,
  reminderRepo: ReminderRepository,
  stretchRepo: StretchLogRepository
) {
  return {
    getToday(): SummaryResponse {
      const { startIso, endExclusiveIso, dateLabel } = getLocalDayBounds()
      const summary = buildSummary(dateLabel, startIso, endExclusiveIso, focusRepo, reminderRepo, stretchRepo)
      return { summary, insight: generateInsight(summary) }
    },

    getYesterday(): SummaryResponse {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const { startIso, endExclusiveIso, dateLabel } = getLocalDayBounds(yesterday)
      const summary = buildSummary(dateLabel, startIso, endExclusiveIso, focusRepo, reminderRepo, stretchRepo)
      return { summary, insight: generateInsight(summary) }
    },

    getLastSevenDays(): SummaryResponse {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      const { startIso } = getLocalDayBounds(sevenDaysAgo)
      const { endExclusiveIso } = getLocalDayBounds()
      const summary = buildSummary('Last 7 Days', startIso, endExclusiveIso, focusRepo, reminderRepo, stretchRepo)
      return { summary, insight: generateInsight(summary) }
    }
  }
}

export type SummaryService = ReturnType<typeof createSummaryService>
