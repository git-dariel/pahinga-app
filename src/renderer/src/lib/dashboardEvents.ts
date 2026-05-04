/** Dispatched after IPC calls that mutate dashboard data (reminders, session, settings). */
export const DASHBOARD_REFRESH_EVENT = 'pahinga-dashboard-refresh'

export function dispatchDashboardRefresh(): void {
  window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT))
}
