import type { OverlayMode } from './user-settings'

export type BreakOverlayOpenReason = 'break_reminder' | 'focus_complete'

export type BreakOverlayTriggerPayload = {
  reminderId: number
  reason: BreakOverlayOpenReason
  durationMinutes: number
  message: string
  instruction: string
  suggestedType: string
  mediaPath: string | null
  allowEmergencyExit: boolean
  allowSnooze: boolean
  overlayMode: OverlayMode
}
