import type Database from 'better-sqlite3'
import type { StretchLog, StretchLogInsert, StretchType } from '../../shared/types'
import { wrapRepositoryError } from './errors'

type StretchLogRow = {
  id: number
  stretch_type: string
  duration_seconds: number | null
  completed_at: string
}

function mapRow(row: StretchLogRow): StretchLog {
  return {
    id: row.id,
    stretchType: row.stretch_type as StretchType,
    durationSeconds: row.duration_seconds,
    completedAt: row.completed_at
  }
}

export function createStretchLogRepository(db: Database.Database) {
  const insert = db.prepare(`
    INSERT INTO stretch_logs (stretch_type, duration_seconds, completed_at)
    VALUES (@stretch_type, @duration_seconds, @completed_at)
  `)

  const getById = db.prepare(`SELECT * FROM stretch_logs WHERE id = ?`)

  const listCompletedBetween = db.prepare(`
    SELECT * FROM stretch_logs
    WHERE completed_at >= @start AND completed_at < @end
    ORDER BY completed_at ASC
  `)

  return {
    create(input: StretchLogInsert): StretchLog {
      try {
        const result = insert.run({
          stretch_type: input.stretchType,
          duration_seconds: input.durationSeconds ?? null,
          completed_at: input.completedAt
        })
        const id = Number(result.lastInsertRowid)
        const row = getById.get(id) as StretchLogRow | undefined
        if (!row) {
          throw new Error('stretch_logs insert failed')
        }
        return mapRow(row)
      } catch (cause) {
        throw wrapRepositoryError('stretch_logs.create', cause)
      }
    },

    getById(id: number): StretchLog | null {
      try {
        const row = getById.get(id) as StretchLogRow | undefined
        return row ? mapRow(row) : null
      } catch (cause) {
        throw wrapRepositoryError('stretch_logs.getById', cause)
      }
    },

    listCompletedBetween(startIso: string, endIso: string): StretchLog[] {
      try {
        const rows = listCompletedBetween.all({ start: startIso, end: endIso }) as StretchLogRow[]
        return rows.map(mapRow)
      } catch (cause) {
        throw wrapRepositoryError('stretch_logs.listCompletedBetween', cause)
      }
    }
  }
}

export type StretchLogRepository = ReturnType<typeof createStretchLogRepository>
