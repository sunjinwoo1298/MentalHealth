/**
 * ExerciseCard Component
 * 
 * Purpose: Individual exercise card with glassmorphic design
 * Features:
 * - Glassmorphic semi-transparent background with rounded corners
 * - Animated entrance with fade and upward slide
 * - 3D tilt effect and glow on hover
 * - Pulse animation on exercise icon
 * - Gradient-colored "Start Exercise" button
 * - Responsive design for mobile and tablet
 */

import { useState, useEffect } from 'react'
import { Clock, Tag, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string
  title: string
  description: string
  duration: string
  difficulty: string
  icon: string
  color: string
  videoUrl: string
  instructions: string[]
  keyBenefits: string[]
  category: string
}

interface ExerciseCardProps {
  exercise: Exercise
  onStart: (id: string) => void
  delay?: number
}

export default function ExerciseCard({ exercise, onStart, delay = 0 }: ExerciseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])

  const getColorTheme = (color: string) => {
    const themes = {
      blue: {
        gradient: 'from-blue-400 to-cyan-500',
        shadow: 'shadow-blue-200/30',
        glow: 'hover:shadow-blue-300/50',
        accent: 'border-blue-200/50'
      },
      purple: {
        gradient: 'from-purple-400 to-violet-500',
        shadow: 'shadow-purple-200/30',
        glow: 'hover:shadow-purple-300/50',
        accent: 'border-purple-200/50'
      },
      green: {
        gradient: 'from-green-400 to-emerald-500',
        shadow: 'shadow-green-200/30',
        glow: 'hover:shadow-green-300/50',
        accent: 'border-green-200/50'
      },
      orange: {
        gradient: 'from-orange-400 to-red-500',
        shadow: 'shadow-orange-200/30',
        glow: 'hover:shadow-orange-300/50',
        accent: 'border-orange-200/50'
      },
      pink: {
        gradient: 'from-pink-400 to-rose-500',
        shadow: 'shadow-pink-200/30',
        glow: 'hover:shadow-pink-300/50',
        accent: 'border-pink-200/50'
      },
      indigo: {
        gradient: 'from-indigo-400 to-blue-500',
        shadow: 'shadow-indigo-200/30',
        glow: 'hover:shadow-indigo-300/50',
        accent: 'border-indigo-200/50'
      }
    }
    return themes[color as keyof typeof themes] || themes.blue
  }

  const theme = getColorTheme(exercise.color)

  return (
    <div
      className={cn(
        'group relative p-8 rounded-[20px] bg-white/70 backdrop-blur-lg',
        'border border-white/60 shadow-lg transition-all duration-500 ease-out',
        'cursor-pointer transform-gpu',
        theme.shadow,
        theme.glow,
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        isHovered && 'rotate-y-2 rotate-x-1 scale-105'
      )}
      style={{
        transform: isHovered 
          ? 'perspective(1000px) rotateY(5deg) rotateX(2deg) scale(1.05)' 
          : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(16, 185, 129, 0.3)' 
          : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`exercise-title-${exercise.id}`}
    >
      {/* Header Section */}
      <div className="text-center mb-6">
        {/* Animated Icon */}
        <div className="text-6xl mb-4 animate-pulse-gentle motion-reduce:animate-none">
          <span role="img" aria-label={exercise.title}>
            {exercise.icon}
          </span>
        </div>
        
        {/* Title */}
        <h3 
          id={`exercise-title-${exercise.id}`}
          className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300"
        >
          {exercise.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
          {exercise.description}
        </p>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {/* Duration Tag */}
        <span 
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-white/60 backdrop-blur-sm border',
            theme.accent,
            'text-sm font-medium text-gray-700'
          )}
        >
          <Clock className="w-4 h-4" />
          {exercise.duration}
        </span>

        {/* Difficulty Tag */}
        <span 
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-white/60 backdrop-blur-sm border',
            theme.accent,
            'text-sm font-medium text-gray-700'
          )}
        >
          <Tag className="w-4 h-4" />
          {exercise.difficulty}
        </span>
      </div>

      {/* Category Badge */}
      <div className="text-center mb-6">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {exercise.category}
        </span>
      </div>

      {/* Start Button */}
      <button
        onClick={() => onStart(exercise.id)}
        className={cn(
          'w-full py-4 rounded-2xl font-bold text-white text-lg',
          'bg-gradient-to-r transition-all duration-300 transform',
          'hover:scale-105 hover:shadow-2xl active:scale-95',
          'flex items-center justify-center gap-3',
          'relative overflow-hidden',
          theme.gradient
        )}
        aria-label={`Start ${exercise.title} exercise`}
      >
        {/* Shimmer Effect */}
        <span 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 0.6s ease-in-out'
          }}
        />
        
        {/* Button Content */}
        <Play className="w-5 h-5 fill-current" />
        <span className="relative z-10">Start Exercise</span>
      </button>

      {/* Benefits Preview */}
      <div className="mt-6 pt-6 border-t border-white/40">
        <p className="text-xs text-gray-500 text-center mb-3 font-semibold uppercase tracking-wide">
          Key Benefits
        </p>
        <div className="space-y-1">
          {exercise.keyBenefits.slice(0, 3).map((benefit, index) => (
            <p key={index} className="text-sm text-gray-600 text-center">
              {benefit}
            </p>
          ))}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div 
        className={cn(
          'absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100',
          'transition-opacity duration-500 pointer-events-none',
          'bg-gradient-to-br',
          theme.gradient.replace('from-', 'from-').replace('to-', 'to-') + '/5'
        )}
      />
    </div>
  )
}

// Add this to your global CSS or component styles for the gentle pulse animation
const style = document.createElement('style')
style.textContent = `
  @keyframes pulse-gentle {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }
  
  .animate-pulse-gentle {
    animation: pulse-gentle 3s ease-in-out infinite;
  }
`
document.head.appendChild(style)
