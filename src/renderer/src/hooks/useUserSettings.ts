import { useCallback, useEffect, useState } from 'react'
import type { UserSettings, UserSettingsUpdate } from '@shared/types'
import { pahingaApi } from '@renderer/services/pahingaApi'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

export function useUserSettings(): {
  data: UserSettings | null
  status: LoadStatus
  error: Error | null
  reload: () => Promise<void>
  save: (patch: UserSettingsUpdate) => Promise<UserSettings>
} {
  const [data, setData] = useState<UserSettings | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const row = await pahingaApi.getSettings()
      setData(row)
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(async (patch: UserSettingsUpdate) => {
    setError(null)
    try {
      const row = await pahingaApi.updateSettings(patch)
      setData(row)
      setStatus('success')
      return row
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      throw err
    }
  }, [])

  return { data, status, error, reload, save }
}
