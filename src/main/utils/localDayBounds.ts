/**
 * Calendar-day bounds in the system local timezone, as ISO strings (UTC instant).
 */
export function getLocalDayBounds(now: Date = new Date()): {
  startIso: string
  endExclusiveIso: string
  dateLabel: string
} {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const endExclusive = new Date(start)
  endExclusive.setDate(endExclusive.getDate() + 1)
  return {
    startIso: start.toISOString(),
    endExclusiveIso: endExclusive.toISOString(),
    dateLabel: start.toISOString().slice(0, 10)
  }
}
