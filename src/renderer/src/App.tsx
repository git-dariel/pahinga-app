import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OnboardingGate } from './components/OnboardingGate'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import FocusTimer from './pages/FocusTimer'
import StretchGuide from './pages/StretchGuide'
import DailySummary from './pages/DailySummary'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route element={<OnboardingGate />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="focus" element={<FocusTimer />} />
            <Route path="stretch" element={<StretchGuide />} />
            <Route path="summary" element={<DailySummary />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
