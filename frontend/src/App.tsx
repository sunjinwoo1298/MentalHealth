import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import OnboardingFlow from './pages/OnboardingFlow'
import ProfilePage from './pages/ProfilePage'
import PrivacyPage from './pages/PrivacyPage'
import SettingsPage from './pages/SettingsPage'
import VrmAvatarPage from './pages/VrmAvatarPage'
import GamificationPage from './pages/GamificationPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/vrm-avatar" element={<VrmAvatarPage />} />
          <Route path="/gamification" element={<GamificationPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
