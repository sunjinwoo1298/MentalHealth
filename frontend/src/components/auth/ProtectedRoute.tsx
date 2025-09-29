import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
}

/**
 * ProtectedRoute Component
 * 
 * Purpose: Protects routes that require authentication
 * Features:
 * - Redirects unauthenticated users to login page
 * - Preserves intended destination for post-login redirect
 * - Shows loading state while checking authentication
 * - Handles different authentication states
 * 
 * Props:
 * - children: components to render if authenticated
 * - requireAuth: whether authentication is required (default: true)
 * 
 * Behavior:
 * - If loading: shows loading indicator
 * - If not authenticated and auth required: redirects to login with return path
 * - If authenticated or auth not required: renders children
 */
export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is not required, always render children
  if (!requireAuth) {
    return <>{children}</>
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}