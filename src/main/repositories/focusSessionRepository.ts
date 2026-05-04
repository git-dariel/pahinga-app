import type Database from 'better-sqlite3'
import type {
  FocusSession,
  FocusSessionInsert,
  FocusSessionStatus,
  FocusSessionUpdate
} from '../../shared/types'
import { nowIso } from '../database/timestamps'
import { wrapRepositoryError } from './errors'

type FocusSessionRow = {
  id: number
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  status: string
}

function mapRow(row: FocusSessionRow): FocusSession {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMinutes: row.duration_minutes,
    status: row.status as FocusSessionStatus
  }
}

export function createFocusSessionRepository(db: Database.Database) {
  const insert = db.prepare(`
    INSERT INTO focus_sessions (started_at, status)
    VALUES (@started_at, COALESCE(@status, 'in_progress'))
  `)

  const update = db.prepare(`
    UPDATE focus_sessions SET
      ended_at = COALESCE(@ended_at, ended_at),
      duration_minutes = COALESCE(@duration_minutes, duration_minutes),
      status = COALESCE(@status, status)
    WHERE id = @id
  `)

  const getById = db.prepare(`SELECT * FROM focus_sessions WHERE id = ?`)

  const listStartedBetween = db.prepare(`
    SELECT * FROM focus_sessions
    WHERE started_at >= @start AND started_at < @end
    ORDER BY started_at ASC
  `)

  return {
    create(input: FocusSessionInsert): FocusSession {
      try {
        const result = insert.run({
          started_at: input.startedAt ?? nowIso(),
          status: input.status ?? null
        })
        const id = Number(result.lastInsertRowid)
        const row = getById.get(id) as FocusSessionRow | undefined
        if (!row) {
          throw new Error('focus_sessions insert failed')
        }
        return mapRow(row)
      } catch (cause) {
        throw wrapRepositoryError('focus_sessions.create', cause)
      }
    },

    updateById(id: number, patch: FocusSessionUpdate): FocusSession {
      try {
        update.run({
          id,
          ended_at: patch.endedAt ?? null,
          duration_minutes: patch.durationMinutes ?? null,
          status: patch.status ?? null
        })
        const row = getById.get(id) as FocusSessionRow | undefined
        if (!row) {
          throw new Error('focus_sessions not found')
        }
        return mapRow(row)
      } catch (cause) {
        throw wrapRepositoryError('focus_sessions.updateById', cause)
      }
    },

    getById(id: number): FocusSession | null {
      try {
        const row = getById.get(id) as FocusSessionRow | undefined
        return row ? mapRow(row) : null
      } catch (cause) {
        throw wrapRepositoryError('focus_sessions.getById', cause)
      }
    },

    listStartedBetween(startIso: string, endIso: string): FocusSession[] {
      try {
        const rows = listStartedBetween.all({ start: startIso, end: endIso }) as FocusSessionRow[]
        return rows.map(mapRow)
      } catch (cause) {
        throw wrapRepositoryError('focus_sessions.listStartedBetween', cause)
      }
    }
  }
}

export type FocusSessionRepository = ReturnType<typeof createFocusSessionRepository>
