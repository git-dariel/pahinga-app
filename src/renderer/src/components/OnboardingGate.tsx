import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { pahingaApi } from '@renderer/services/pahingaApi'

export type OnboardingOutletContext = {
  markOnboardingComplete: () => void
}

export function OnboardingGate(): React.JSX.Element {
  const [loading, setLoading] = useState(true)
  const [complete, setComplete] = useState(false)
  const location = useLocation()

  useEffect(() => {
    void pahingaApi.isOnboardingComplete().then(setComplete).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div
          className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"
          aria-label="Loading"
        />
      </div>
    )
  }

  const onOnboardingPath = location.pathname.startsWith('/onboarding')

  if (!complete && !onOnboardingPath) {
    return <Navigate to="/onboarding" replace />
  }
  if (complete && onOnboardingPath) {
    return <Navigate to="/dashboard" replace />
  }

  const context: OnboardingOutletContext = {
    markOnboardingComplete: () => setComplete(true)
  }

  return <Outlet context={context} />
}
