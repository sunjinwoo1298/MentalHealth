import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { createContext,useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { GamificationProvider } from './contexts/GamificationContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import Index from './pages/Index'
import Layout from './components/layout/Layout'
import OnboardingFlow from './pages/OnboardingFlow'
import ProfilePage from './pages/ProfilePage'
import PrivacyPage from './pages/PrivacyPage'
import SettingsPage from './pages/SettingsPage'
import VrmAvatarPage from './pages/VrmAvatarPage'
import GamificationPage from './pages/GamificationPage'
import MeditationPage from './pages/NewMeditationPage'
import JournalPage from './pages/JournalPage'
import MoodPage from './pages/MoodPage'
import CheckInPage from './pages/CheckInPage'
import TestGamificationPage from './pages/TestGamificationPage'
import TherapistFinder from './pages/TherapistFinder'
// import './App.css'
import './global.css'
// import './styles/animations.css'

type MentalHealthContextType = {
  currentContext: string;
  setCurrentContext: React.Dispatch<React.SetStateAction<string>>;
};

export const mentalHealthContext = createContext<MentalHealthContextType | undefined>(undefined);

function App() {
  const [currentContext, setCurrentContext] = useState("general");


  return (
    <AuthProvider>
      <mentalHealthContext.Provider value={{currentContext,setCurrentContext}}>
      <GamificationProvider>
        <Router>
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/" element={<ProtectedRoute requireAuth={false}><HomePage /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute requireAuth={false}><PrivacyPage /></ProtectedRoute>} />
            
            {/* Auth routes - only accessible when NOT logged in */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/therapists" element={<TherapistFinder />} />
              <Route path="/gamification" element={<GamificationPage />} />
              <Route path="/meditation" element={<MeditationPage />} />
              <Route path="/mood" element={<MoodPage />} />
              <Route path="/checkin" element={<CheckInPage />} />
              <Route path="/test-gamification" element={<TestGamificationPage />} />
            </Route>
            
            {/* Other protected routes outside layout */}
            <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><VrmAvatarPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
          </Routes>
        </Router>
      </GamificationProvider>
      </mentalHealthContext.Provider>
      <footer className="text-center text-sm text-gray-500 mt-4">
  <a
    href="https://www.flaticon.com/free-icons/edit-tools"
    title="edit tools icons"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:underline"
  >
  </a>
</footer>

    </AuthProvider>
  )
}

export default App
