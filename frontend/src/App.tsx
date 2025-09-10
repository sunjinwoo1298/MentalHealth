import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import { useAuth } from './hooks/useAuth';

// Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import WellnessCenter from './pages/WellnessCenter';
import ProfilePage from './pages/ProfilePage';
import ProfessionalNetwork from './pages/ProfessionalNetwork';
import PrivacySettings from './pages/PrivacySettings';

// Navigation
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import CrisisModal from './components/CrisisModal';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2', // Calming blue
      light: '#7BB3F0',
      dark: '#2E5BBA',
    },
    secondary: {
      main: '#50C878', // Soothing green
      light: '#7DD894',
      dark: '#3A9B5C',
    },
    background: {
      default: '#F8FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#5A6C7D',
    },
    error: {
      main: '#E74C3C',
    },
    warning: {
      main: '#F39C12',
    },
    success: {
      main: '#27AE60',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '12px 24px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar />}
        <main className={isAuthenticated ? 'pt-16' : ''}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
            />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />
            <Route path="/wellness" element={
              <PrivateRoute>
                <WellnessCenter />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/professionals" element={
              <PrivateRoute>
                <ProfessionalNetwork />
              </PrivateRoute>
            } />
            <Route path="/privacy" element={
              <PrivateRoute>
                <PrivacySettings />
              </PrivateRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Crisis Intervention Modal */}
        <CrisisModal />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
