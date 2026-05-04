/** Main → renderer when a break reminder fires (Phase 5). */
export type BreakReminderTriggerPayload = {
  reminderId: number
  suggestedType: string
  durationMinutes: number
  instruction: string
}
