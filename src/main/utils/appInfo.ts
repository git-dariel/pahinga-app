import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import type { AppInfo } from '../../shared/types'

export function getAppInfo(): AppInfo {
  return {
    name: app.getName(),
    version: app.getVersion(),
    environment: is.dev ? 'development' : 'production',
    platform: process.platform,
    packaged: app.isPackaged
  }
}
