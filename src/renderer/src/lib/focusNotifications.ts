import type { UserSettings } from '@shared/types'

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notifyFocusSessionComplete(settings: UserSettings): void {
  if (!settings.notificationsEnabled) return
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  new Notification('Pahinga', {
    body: 'Focus session complete. Take a short break.'
  })
}
