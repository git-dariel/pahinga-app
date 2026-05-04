import type { WorkStyle } from './types'
import { WORK_STYLES } from './constants'

export const WORK_STYLE_LABELS: Record<WorkStyle, string> = {
  developer: 'Developer / Programmer',
  student: 'Student',
  office_worker: 'Office Worker',
  freelancer: 'Freelancer',
  designer_editor: 'Designer / Editor',
  other: 'Other'
}

export const WORK_STYLE_OPTIONS: { value: WorkStyle; label: string }[] = WORK_STYLES.map((value) => ({
  value,
  label: WORK_STYLE_LABELS[value]
}))
