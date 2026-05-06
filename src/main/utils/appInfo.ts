import { app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import type { AppInfo } from '../../shared/types'

function getRendererIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'icon.png')
  }
  return join(app.getAppPath(), 'resources', 'icon.png')
}

export function getAppInfo(): AppInfo {
  return {
    name: app.getName(),
    version: app.getVersion(),
    environment: is.dev ? 'development' : 'production',
    platform: process.platform,
    packaged: app.isPackaged,
    iconPath: getRendererIconPath()
  }
}
