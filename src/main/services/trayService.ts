import { app, BrowserWindow, Menu, Tray } from 'electron'
import type { TrayStatus } from '../../shared/types'

type Deps = {
  iconPath: string
  getMainWindow: () => BrowserWindow | null
  startFocus: () => void
  takeBreak: () => void
}

function showMainWindow(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed()) return
  if (!win.isVisible()) win.show()
  if (win.isMinimized()) win.restore()
  win.focus()
}

export function createTrayService(deps: Deps): {
  create(): void
  getStatus(): TrayStatus
  refreshMenu(): void
} {
  let tray: Tray | null = null

  function buildMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Open App',
        click: () => showMainWindow(deps.getMainWindow())
      },
      {
        label: 'Start Focus',
        click: () => {
          deps.startFocus()
          showMainWindow(deps.getMainWindow())
        }
      },
      {
        label: 'Take Break',
        click: () => deps.takeBreak()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ])
  }

  return {
    create(): void {
      if (tray) return
      tray = new Tray(deps.iconPath)
      tray.setToolTip('Pahinga is keeping your reminders running.')
      tray.setContextMenu(buildMenu())
      tray.on('click', () => showMainWindow(deps.getMainWindow()))
    },

    getStatus(): TrayStatus {
      return {
        available: true,
        active: tray !== null,
        closeToTrayEnabled: process.platform !== 'darwin',
        tooltip: 'Pahinga is keeping your reminders running.'
      }
    },

    refreshMenu(): void {
      tray?.setContextMenu(buildMenu())
    }
  }
}

export type TrayService = ReturnType<typeof createTrayService>
