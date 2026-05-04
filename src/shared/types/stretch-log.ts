export type StretchType = 'neck' | 'shoulder' | 'wrist' | 'eyes'

export interface StretchLog {
  id: number
  stretchType: StretchType
  durationSeconds: number | null
  completedAt: string
}

export interface StretchLogInsert {
  stretchType: StretchType
  durationSeconds?: number | null
  completedAt: string
}
