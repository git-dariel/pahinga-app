import { ipcMain } from 'electron'
import type Database from 'better-sqlite3'
import { SETTINGS_IPC_CHANNELS } from '../../shared/ipc'
import { createSettingsService } from '../services/settingsService'

export function registerPahingaIpc(db: Database.Database): void {
  const settings = createSettingsService(db)

  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.GET)
  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.UPDATE)
  ipcMain.removeHandler(SETTINGS_IPC_CHANNELS.IS_ONBOARDING_COMPLETE)

  ipcMain.handle(SETTINGS_IPC_CHANNELS.GET, () => {
    return settings.get()
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.UPDATE, (_event, patch: unknown) => {
    return settings.update(patch)
  })

  ipcMain.handle(SETTINGS_IPC_CHANNELS.IS_ONBOARDING_COMPLETE, () => {
    return settings.isOnboardingComplete()
  })
}
