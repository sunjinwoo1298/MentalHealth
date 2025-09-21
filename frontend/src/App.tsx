import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { GamificationProvider } from './contexts/GamificationContext'
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
import MeditationPage from './pages/MeditationPage'
import JournalPage from './pages/JournalPage'
import MoodPage from './pages/MoodPage.tsx'
import CheckInPage from './pages/CheckInPage'
import TestGamificationPage from './pages/TestGamificationPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
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
            <Route path="/meditation" element={<MeditationPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/test-gamification" element={<TestGamificationPage />} />
          </Routes>
        </Router>
      </GamificationProvider>
    </AuthProvider>
  )
}

export default App
