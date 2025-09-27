import { StrictMode, Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode intentionally double-renders components in development to detect side effects
// This causes duplicate API calls in development, but improves code quality
// For production, you can remove StrictMode to eliminate duplicate calls
const AppWrapper = process.env.NODE_ENV === 'development' ? StrictMode : Fragment;

createRoot(document.getElementById('root')!).render(
  <AppWrapper>
    <App />
  </AppWrapper>,
)
