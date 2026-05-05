export type NotificationPermissionStatus = 'ready' | 'disabled_in_settings' | 'unsupported'

export type NotificationPreviewKind = 'break' | 'water'

export interface DesktopNotificationStatus {
  supported: boolean
  enabledInSettings: boolean
  permissionStatus: NotificationPermissionStatus
  message: string
}

export interface TrayStatus {
  available: boolean
  active: boolean
  closeToTrayEnabled: boolean
  tooltip: string
}
