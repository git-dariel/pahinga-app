export type AppEnvironment = 'development' | 'production'

export interface AppInfo {
  name: string
  version: string
  environment: AppEnvironment
  platform: NodeJS.Platform
  packaged: boolean
}
