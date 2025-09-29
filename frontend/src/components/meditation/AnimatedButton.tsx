/**
 * AnimatedButton Component
 * 
 * Purpose: Reusable animated button with various effects
 * Features:
 * - Gradient backgrounds with theme colors
 * - Continuous pulse/glow animation
 * - Hover scale and shimmer effects
 * - Loading states and disabled handling
 * - Keyboard accessibility
 * 
 * Props:
 * - children: button content
 * - onClick: click handler
 * - variant: 'primary' | 'secondary' | 'meditation'
 * - color: theme color for gradients ('green', 'orange', 'purple', 'blue')
 * - size: 'sm' | 'md' | 'lg' | 'xl'
 * - loading: boolean for loading state
 * - disabled: boolean for disabled state
 * - className: additional CSS classes
 * 
 * Animation Notes:
 * - Gentle pulse animation runs continuously
 * - Shimmer effect triggers on hover
 * - Scale transform on hover and active states
 * - Smooth transitions for all states
 */

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'meditation'
  color?: 'green' | 'orange' | 'purple' | 'blue' | 'pink' | 'indigo'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    color = 'blue', 
    size = 'md', 
    loading = false, 
    disabled, 
    className, 
    ...props 
  }, ref) => {
    
    const getColorClasses = (buttonColor: string) => {
      const colorMap = {
        green: {
          gradient: 'from-green-400 to-emerald-500',
          hoverGradient: 'hover:from-green-500 hover:to-emerald-600',
          glow: 'shadow-green-200/50',
          hoverGlow: 'hover:shadow-green-300/60'
        },
        orange: {
          gradient: 'from-orange-400 to-red-500',
          hoverGradient: 'hover:from-orange-500 hover:to-red-600',
          glow: 'shadow-orange-200/50',
          hoverGlow: 'hover:shadow-orange-300/60'
        },
        purple: {
          gradient: 'from-purple-400 to-violet-500',
          hoverGradient: 'hover:from-purple-500 hover:to-violet-600',
          glow: 'shadow-purple-200/50',
          hoverGlow: 'hover:shadow-purple-300/60'
        },
        blue: {
          gradient: 'from-blue-400 to-cyan-500',
          hoverGradient: 'hover:from-blue-500 hover:to-cyan-600',
          glow: 'shadow-blue-200/50',
          hoverGlow: 'hover:shadow-blue-300/60'
        },
        pink: {
          gradient: 'from-pink-400 to-rose-500',
          hoverGradient: 'hover:from-pink-500 hover:to-rose-600',
          glow: 'shadow-pink-200/50',
          hoverGlow: 'hover:shadow-pink-300/60'
        },
        indigo: {
          gradient: 'from-indigo-400 to-purple-500',
          hoverGradient: 'hover:from-indigo-500 hover:to-purple-600',
          glow: 'shadow-indigo-200/50',
          hoverGlow: 'hover:shadow-indigo-300/60'
        }
      }
      return colorMap[buttonColor as keyof typeof colorMap] || colorMap.blue
    }

    const getSizeClasses = (buttonSize: string) => {
      const sizeMap = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl'
      }
      return sizeMap[buttonSize as keyof typeof sizeMap] || sizeMap.md
    }

    const colors = getColorClasses(color)
    const sizeClasses = getSizeClasses(size)

    const baseClasses = cn(
      // Base styles
      'relative inline-flex items-center justify-center gap-3 font-semibold rounded-2xl',
      'transition-all duration-300 ease-out transform-gpu',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
      'overflow-hidden group',
      
      // Size classes
      sizeClasses,
      
      // Variant styles
      variant === 'primary' && [
        'text-white bg-gradient-to-r shadow-lg',
        colors.gradient,
        colors.hoverGradient,
        colors.glow,
        colors.hoverGlow,
        'hover:scale-105 hover:shadow-xl',
        'active:scale-95',
        'animate-pulse-gentle motion-reduce:animate-none'
      ],
      
      variant === 'secondary' && [
        'text-gray-700 bg-white border-2 border-gray-200',
        'hover:border-gray-300 hover:shadow-md',
        'hover:scale-102 active:scale-98'
      ],
      
      variant === 'meditation' && [
        'text-white bg-gradient-to-r shadow-xl',
        colors.gradient,
        colors.hoverGradient,
        colors.glow,
        colors.hoverGlow,
        'hover:scale-110 hover:shadow-2xl',
        'active:scale-95',
        'animate-pulse-glow motion-reduce:animate-none'
      ],
      
      // Disabled state
      (disabled || loading) && [
        'opacity-50 cursor-not-allowed',
        'hover:scale-100 hover:shadow-lg'
      ],
      
      className
    )

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={baseClasses}
        {...props}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-3">
          {loading && (
            <svg 
              className="animate-spin h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-label="Loading"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {children}
        </span>
      </button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

export default AnimatedButton