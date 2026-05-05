import type Database from 'better-sqlite3'
import type { Reminder, ReminderInsert, ReminderStatus, ReminderType, ReminderUpdate } from '../../shared/types'
import { wrapRepositoryError } from './errors'

type ReminderRow = {
  id: number
  type: string
  triggered_at: string
  completed_at: string | null
  status: string
}

function mapRow(row: ReminderRow): Reminder {
  return {
    id: row.id,
    type: row.type as ReminderType,
    triggeredAt: row.triggered_at,
    completedAt: row.completed_at,
    status: row.status as ReminderStatus
  }
}

export function createReminderRepository(db: Database.Database) {
  const insert = db.prepare(`
    INSERT INTO reminders (type, triggered_at, status)
    VALUES (@type, @triggered_at, COALESCE(@status, 'pending'))
  `)

  const updateFull = db.prepare(`
    UPDATE reminders SET completed_at = ?, status = ?
    WHERE id = ?
  `)

  const getById = db.prepare(`SELECT * FROM reminders WHERE id = ?`)

  const findPendingBreak = db.prepare(`
    SELECT * FROM reminders
    WHERE type = 'break' AND status = 'pending'
    ORDER BY id DESC
    LIMIT 1
  `)

  const findPendingWater = db.prepare(`
    SELECT * FROM reminders
    WHERE type = 'water' AND status = 'pending'
    ORDER BY id DESC
    LIMIT 1
  `)

  const listTriggeredBetween = db.prepare(`
    SELECT * FROM reminders
    WHERE triggered_at >= @start AND triggered_at < @end
    ORDER BY triggered_at ASC
  `)

  return {
    create(input: ReminderInsert): Reminder {
      try {
        const result = insert.run({
          type: input.type,
          triggered_at: input.triggeredAt,
          status: input.status ?? null
        })
        const id = Number(result.lastInsertRowid)
        const row = getById.get(id) as ReminderRow | undefined
        if (!row) {
          throw new Error('reminders insert failed')
        }
        return mapRow(row)
      } catch (cause) {
        throw wrapRepositoryError('reminders.create', cause)
      }
    },

    updateById(id: number, patch: ReminderUpdate): Reminder {
      try {
        const existing = getById.get(id) as ReminderRow | undefined
        if (!existing) {
          throw new Error('reminders not found')
        }
        const completed_at =
          patch.completedAt !== undefined ? patch.completedAt : existing.completed_at
        const status = patch.status !== undefined ? patch.status : existing.status
        updateFull.run(completed_at, status, id)
        const row = getById.get(id) as ReminderRow | undefined
        if (!row) {
          throw new Error('reminders not found')
        }
        return mapRow(row)
      } catch (cause) {
        throw wrapRepositoryError('reminders.updateById', cause)
      }
    },

    findPendingBreakReminder(): Reminder | null {
      try {
        const row = findPendingBreak.get() as ReminderRow | undefined
        return row ? mapRow(row) : null
      } catch (cause) {
        throw wrapRepositoryError('reminders.findPendingBreakReminder', cause)
      }
    },

    findPendingWaterReminder(): Reminder | null {
      try {
        const row = findPendingWater.get() as ReminderRow | undefined
        return row ? mapRow(row) : null
      } catch (cause) {
        throw wrapRepositoryError('reminders.findPendingWaterReminder', cause)
      }
    },

    getById(id: number): Reminder | null {
      try {
        const row = getById.get(id) as ReminderRow | undefined
        return row ? mapRow(row) : null
      } catch (cause) {
        throw wrapRepositoryError('reminders.getById', cause)
      }
    },

    listTriggeredBetween(startIso: string, endIso: string): Reminder[] {
      try {
        const rows = listTriggeredBetween.all({ start: startIso, end: endIso }) as ReminderRow[]
        return rows.map(mapRow)
      } catch (cause) {
        throw wrapRepositoryError('reminders.listTriggeredBetween', cause)
      }
    }
  }
}

export type ReminderRepository = ReturnType<typeof createReminderRepository>
