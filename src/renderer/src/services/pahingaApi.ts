import type { UserSettings, UserSettingsUpdate } from '@shared/types'

function getPahinga(): Window['api']['pahinga'] {
  if (typeof window === 'undefined' || !window.api?.pahinga) {
    throw new Error('Pahinga preload API is not available')
  }
  return window.api.pahinga
}

export const pahingaApi = {
  getSettings(): Promise<UserSettings> {
    return getPahinga().getSettings()
  },

  updateSettings(patch: UserSettingsUpdate): Promise<UserSettings> {
    return getPahinga().updateSettings(patch)
  },

  isOnboardingComplete(): Promise<boolean> {
    return getPahinga().isOnboardingComplete()
  }
}
