import { useCallback, useEffect, useState } from 'react'
import type { DashboardToday } from '@shared/types'
import { pahingaApi } from '@renderer/services/pahingaApi'

type Status = 'loading' | 'ready' | 'error'

export function useDashboard(): {
  data: DashboardToday | null
  status: Status
  error: Error | null
  refresh: () => Promise<void>
  startSession: (plannedMinutes?: number) => Promise<void>
  pauseSession: () => Promise<void>
  resumeSession: () => Promise<void>
  stopSession: () => Promise<void>
} {
  const [data, setData] = useState<DashboardToday | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    try {
      const next = await pahingaApi.getDashboardToday()
      setData(next)
      setStatus('ready')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const intervalMs = data?.sessionPhase !== 'idle' ? 1000 : 20000
    const id = window.setInterval(() => {
      void refresh()
    }, intervalMs)
    return () => clearInterval(id)
  }, [refresh, data?.sessionPhase])

  const startSession = useCallback(async (plannedMinutes?: number) => {
    const next = await pahingaApi.sessionStart(
      plannedMinutes !== undefined ? { plannedMinutes } : undefined
    )
    setData(next)
    setError(null)
    setStatus('ready')
  }, [])

  const pauseSession = useCallback(async () => {
    const next = await pahingaApi.sessionPause()
    setData(next)
    setError(null)
    setStatus('ready')
  }, [])

  const resumeSession = useCallback(async () => {
    const next = await pahingaApi.sessionResume()
    setData(next)
    setError(null)
    setStatus('ready')
  }, [])

  const stopSession = useCallback(async () => {
    const next = await pahingaApi.sessionCancel()
    setData(next)
    setError(null)
    setStatus('ready')
  }, [])

  return { data, status, error, refresh, startSession, pauseSession, resumeSession, stopSession }
}
