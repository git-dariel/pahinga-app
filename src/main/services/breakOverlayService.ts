import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { BREAK_OVERLAY_EVENT } from '../../shared/ipc'
import type { BreakOverlayTriggerPayload } from '../../shared/types'

type Deps = {
  getMainWindow: () => BrowserWindow | null
}

export function createBreakOverlayService(deps: Deps) {
  let overlayWindow: BrowserWindow | null = null
  let lastPayload: BreakOverlayTriggerPayload | null = null

  function getOverlayUrl(): string {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      return `${process.env['ELECTRON_RENDERER_URL']}#/overlay-break`
    }
    return join(__dirname, '../renderer/index.html')
  }

  function createOverlayWindow(): BrowserWindow {
    const win = new BrowserWindow({
      fullscreen: true,
      resizable: false,
      movable: false,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      autoHideMenuBar: true,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        // Allow file:// GIF/MP4 when overlay loads from http://localhost in dev.
        webSecurity: false
      }
    })

    win.setAlwaysOnTop(true, 'screen-saver')
    win.setFullScreen(true)
    win.once('ready-to-show', () => win.show())
    win.on('closed', () => {
      if (overlayWindow === win) overlayWindow = null
    })

    const url = getOverlayUrl()
    if (url.endsWith('.html')) {
      void win.loadFile(url, { hash: '/overlay-break' })
    } else {
      void win.loadURL(url)
    }

    return win
  }

  function ensureWindow(): BrowserWindow {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
      overlayWindow = createOverlayWindow()
    }
    return overlayWindow
  }

  function deliverPayload(win: BrowserWindow): void {
    if (win.isDestroyed() || !lastPayload) return
    win.webContents.send(BREAK_OVERLAY_EVENT, lastPayload)
  }

  return {
    getLastPayload(): BreakOverlayTriggerPayload | null {
      return lastPayload
    },

    open(payload: BreakOverlayTriggerPayload): void {
      lastPayload = payload
      const win = ensureWindow()
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()

      const flush = (): void => deliverPayload(win)

      if (win.webContents.isLoading()) {
        win.webContents.once('did-finish-load', flush)
      } else {
        // Defer so the overlay renderer can attach ipc listeners first (HMR / slow JS).
        setTimeout(flush, 0)
        setTimeout(flush, 120)
      }

      const main = deps.getMainWindow()
      if (main && !main.isDestroyed()) {
        main.blur()
      }
    },

    close(): void {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.hide()
      }
    }
  }
}

export type BreakOverlayService = ReturnType<typeof createBreakOverlayService>
