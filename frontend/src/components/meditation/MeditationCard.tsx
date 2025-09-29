/**
 * MeditationCard Component
 * 
 * Purpose: Individual meditation session card with glassmorphic design
 * Features:
 * - Glassmorphic semi-transparent background with rounded corners (20px)
 * - Animated entrance with fade and upward slide
 * - 3D tilt effect and glow on hover
 * - Pulse animation on meditation icon
 * - Gradient-colored "Start Meditation" button with shimmer effect
 * - Responsive design for mobile and tablet
 * 
 * Props:
 * - meditation: object with id, title, description, duration, category, icon, color, instructions
 * - onStart: callback function when start button is clicked
 * - delay: animation delay for staggered entrance (in ms)
 * 
 * State Management:
 * - isHovered: tracks hover state for 3D effects
 * - isVisible: controls entrance animation
 * 
 * Animation Notes:
 * - Card slides up and fades in on mount
 * - 3D tilt transform on hover using CSS transforms
 * - Icon pulses continuously with gentle scale animation
 * - Button shimmer effect on hover
 */

import { useState, useEffect } from 'react'
import { Clock, Tag, Play } from 'lucide-react'
import AnimatedButton from './AnimatedButton'
import { cn } from '@/lib/utils'

interface Meditation {
  id: string
  title: string
  description: string
  duration: string
  category: string
  icon: string
  color: string
  instructions: string[]
  keyBenefits: string[]
}

interface MeditationCardProps {
  meditation: Meditation
  onStart: (id: string) => void
  delay?: number
}

export default function MeditationCard({ meditation, onStart, delay = 0 }: MeditationCardProps) {
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
      }
    }
    return themes[color as keyof typeof themes] || themes.blue
  }

  const theme = getColorTheme(meditation.color)

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
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(168, 85, 247, 0.3)' 
          : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`meditation-title-${meditation.id}`}
    >
      {/* Header Section */}
      <div className="text-center mb-6">
        {/* Animated Icon */}
        <div className="text-6xl mb-4 animate-pulse-gentle motion-reduce:animate-none">
          <span role="img" aria-label={meditation.title}>
            {meditation.icon}
          </span>
        </div>
        
        {/* Title */}
        <h3 
          id={`meditation-title-${meditation.id}`}
          className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300"
        >
          {meditation.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
          {meditation.description}
        </p>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <span className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
          'bg-gradient-to-r text-white shadow-md',
          'hover:shadow-lg transition-shadow duration-300',
          theme.gradient
        )}>
          <Clock className="w-4 h-4" />
          {meditation.duration}
        </span>
        
        <span className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
          'bg-white/80 text-gray-700 border border-gray-200',
          'hover:bg-white hover:border-gray-300 transition-all duration-300'
        )}>
          <Tag className="w-4 h-4" />
          {meditation.category}
        </span>
      </div>

      {/* Key Benefits Preview */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">
          Key Benefits
        </h4>
        <ul className="space-y-2">
          {meditation.keyBenefits.slice(0, 3).map((benefit, index) => (
            <li 
              key={index}
              className="flex items-center gap-3 text-gray-600 text-sm"
            >
              <span className="text-lg animate-pulse-gentle motion-reduce:animate-none">
                {benefit.split(' ')[0]}
              </span>
              <span className="flex-1">
                {benefit.split(' ').slice(1).join(' ')}
              </span>
            </li>
          ))}
          {meditation.keyBenefits.length > 3 && (
            <li className="text-gray-400 text-sm text-center mt-3">
              +{meditation.keyBenefits.length - 3} more benefits...
            </li>
          )}
        </ul>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <AnimatedButton
          variant="meditation"
          color={meditation.color as any}
          size="lg"
          onClick={() => onStart(meditation.id)}
          className="w-full"
          aria-describedby={`meditation-desc-${meditation.id}`}
        >
          <Play className="w-5 h-5" />
          Start Meditation
        </AnimatedButton>
      </div>

      {/* Screen reader description */}
      <div 
        id={`meditation-desc-${meditation.id}`} 
        className="sr-only"
      >
        {meditation.title} meditation session, {meditation.duration} long, 
        suitable for {meditation.category} level practitioners.
      </div>
    </div>
  )
}