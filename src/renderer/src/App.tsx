import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import FocusTimer from './pages/FocusTimer'
import StretchGuide from './pages/StretchGuide'
import DailySummary from './pages/DailySummary'
import Settings from './pages/Settings'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="focus" element={<FocusTimer />} />
          <Route path="stretch" element={<StretchGuide />} />
          <Route path="summary" element={<DailySummary />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
