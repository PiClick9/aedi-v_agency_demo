import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import QrEntryPage from './pages/QrEntryPage'

// HashRouter keeps deep links working on GitHub Pages, which serves no
// SPA rewrite rules.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/qr" element={<QrEntryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
