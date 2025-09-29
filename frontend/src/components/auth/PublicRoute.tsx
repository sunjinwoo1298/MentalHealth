import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface PublicRouteProps {
  children: ReactNode
  redirectTo?: string
}

/**
 * PublicRoute Component
 * 
 * Purpose: Protects routes that should only be accessible when NOT authenticated
 * Features:
 * - Redirects authenticated users away from login/register pages
 * - Handles post-login redirects to intended destinations
 * - Shows loading state while checking authentication
 * 
 * Props:
 * - children: components to render if not authenticated
 * - redirectTo: where to redirect authenticated users (default: '/dashboard')
 * 
 * Behavior:
 * - If loading: shows loading indicator
 * - If authenticated: redirects to dashboard or intended destination
 * - If not authenticated: renders children (login/register forms)
 */
export default function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
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

  // If user is authenticated, redirect them away from public routes
  if (isAuthenticated) {
    // Check if there's a return path from login attempts
    const from = (location.state as any)?.from?.pathname
    const destination = from && from !== '/login' && from !== '/register' ? from : redirectTo
    return <Navigate to={destination} replace />
  }

  // User is not authenticated, show public content (login/register)
  return <>{children}</>
}