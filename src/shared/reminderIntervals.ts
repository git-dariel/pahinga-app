/** Break *reminder* interval options from product guide (minutes). */
export const BREAK_REMINDER_OPTIONS = [25, 45, 60] as const
export type BreakReminderMinutes = (typeof BREAK_REMINDER_OPTIONS)[number]

/** Water reminder interval options from product guide (minutes). */
export const WATER_REMINDER_OPTIONS = [20, 40, 60] as const
export type WaterReminderMinutes = (typeof WATER_REMINDER_OPTIONS)[number]

/** Default focus session lengths used in Settings UI (minutes). */
export const FOCUS_DURATION_OPTIONS = [25, 45, 60] as const

/** Default break lengths used in Settings UI (minutes). */
export const BREAK_DURATION_OPTIONS = [5, 10, 15] as const
