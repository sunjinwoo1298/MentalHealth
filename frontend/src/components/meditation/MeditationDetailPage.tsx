/**
 * MeditationDetailPage Component
 * 
 * Purpose: Detailed meditation instruction page with two-panel layout
 * Features:
 * - Two side-by-side instruction panels with glassmorphic design
 * - Each instruction has emoji bullet with rounded highlight background
 * - Panels fade and slide in on page load
 * - Full-width gradient "Start Meditation" buttons matching theme color
 * - Background music changes to meditation-specific track
 * - Responsive design stacks panels vertically on mobile
 * - Smooth animations with reduced motion support
 * 
 * Props:
 * - meditation: meditation object with instructions and theme
 * - onBack: callback function to return to selection page
 * 
 * Layout Notes:
 * - Desktop: Two columns side by side
 * - Mobile/Tablet: Stacked vertically with full width
 * - Instructions animate in with staggered delays
 * - Buttons have glow effects and hover animations
 * 
 * Accessibility:
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - High contrast text and focus indicators
 * - Screen reader friendly structure
 */

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Play, Pause, Clock, Heart, Music, RotateCcw } from 'lucide-react'
import AnimatedButton from './AnimatedButton'
import FloatingShapes from './FloatingShapes'
import BackgroundMusic from './BackgroundMusic'
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
}

interface MeditationDetailPageProps {
  meditation: Meditation
  onBack: () => void
}

export default function MeditationDetailPage({ meditation, onBack }: MeditationDetailPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [startedMeditation, setStartedMeditation] = useState(false)
  const [activeSection, setActiveSection] = useState<'timer' | 'instructions' | 'music'>('timer')
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Music state
  const [selectedMusicTrack, setSelectedMusicTrack] = useState(0)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  // Enhanced animation states
  const [elementsVisible, setElementsVisible] = useState({
    header: false,
    hero: false,
    controls: false,
    instructions: false
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    
    // Staggered element animations
    setTimeout(() => setElementsVisible(prev => ({ ...prev, header: true })), 300)
    setTimeout(() => setElementsVisible(prev => ({ ...prev, hero: true })), 500)
    setTimeout(() => setElementsVisible(prev => ({ ...prev, controls: true })), 700)
    setTimeout(() => setElementsVisible(prev => ({ ...prev, instructions: true })), 900)
    
    return () => clearTimeout(timer)
  }, [])

  // Parse duration and set initial timer
  useEffect(() => {
    const parseDuration = (duration: string) => {
      const match = duration.match(/(\d+)-?(\d+)?\s*mins?/)
      if (match) {
        const minDuration = parseInt(match[1])
        const maxDuration = match[2] ? parseInt(match[2]) : minDuration
        // Use the maximum duration as default
        return maxDuration * 60 // Convert to seconds
      }
      return 600 // Default 10 minutes
    }
    
    const initialTime = parseDuration(meditation.duration)
    setTimeRemaining(initialTime)
    setSelectedDuration(meditation.duration)
  }, [meditation.duration])

  const getColorTheme = (color: string) => {
    const themes = {
      blue: {
        gradient: 'from-blue-400 to-cyan-500',
        lightGradient: 'from-blue-50 to-cyan-50',
        accent: 'border-blue-200',
        glow: 'shadow-blue-200/30',
        text: 'text-blue-600'
      },
      purple: {
        gradient: 'from-purple-400 to-violet-500',
        lightGradient: 'from-purple-50 to-violet-50',
        accent: 'border-purple-200',
        glow: 'shadow-purple-200/30',
        text: 'text-purple-600'
      },
      green: {
        gradient: 'from-green-400 to-emerald-500',
        lightGradient: 'from-green-50 to-emerald-50',
        accent: 'border-green-200',
        glow: 'shadow-green-200/30',
        text: 'text-green-600'
      },
      orange: {
        gradient: 'from-orange-400 to-red-500',
        lightGradient: 'from-orange-50 to-red-50',
        accent: 'border-orange-200',
        glow: 'shadow-orange-200/30',
        text: 'text-orange-600'
      },
      pink: {
        gradient: 'from-pink-400 to-rose-500',
        lightGradient: 'from-pink-50 to-rose-50',
        accent: 'border-pink-200',
        glow: 'shadow-pink-200/30',
        text: 'text-pink-600'
      },
      indigo: {
        gradient: 'from-indigo-400 to-purple-500',
        lightGradient: 'from-indigo-50 to-purple-50',
        accent: 'border-indigo-200',
        glow: 'shadow-indigo-200/30',
        text: 'text-indigo-600'
      }
    }
    return themes[color as keyof typeof themes] || themes.blue
  }

  const theme = getColorTheme(meditation.color)

  // Meditation-specific music tracks
  const meditationTracks = [
    { src: '/audio/deep-meditation.mp3', name: 'Deep Meditation' },
    { src: '/audio/nature-sounds.mp3', name: 'Nature Sounds' },
    { src: '/audio/singing-bowls.mp3', name: 'Singing Bowls' },
    { src: '/audio/zen-garden.mp3', name: 'Zen Garden' },
    { src: '/audio/forest-stream.mp3', name: 'Forest Stream' },
    { src: '/audio/ocean-waves.mp3', name: 'Ocean Waves' }
  ]

  // Timer functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setIsTimerRunning(true)
    setIsMusicPlaying(true)
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          setIsMusicPlaying(false)
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          // Timer finished - could trigger completion sound/notification
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
    setIsMusicPlaying(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setIsMusicPlaying(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // Reset to original duration
    const parseDuration = (duration: string) => {
      const match = duration.match(/(\d+)-?(\d+)?\s*mins?/)
      if (match) {
        const minDuration = parseInt(match[1])
        const maxDuration = match[2] ? parseInt(match[2]) : minDuration
        return maxDuration * 60
      }
      return 600
    }
    setTimeRemaining(parseDuration(meditation.duration))
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Split instructions into two panels
  const midpoint = Math.ceil(meditation.instructions.length / 2)
  const leftPanelInstructions = meditation.instructions.slice(0, midpoint)
  const rightPanelInstructions = meditation.instructions.slice(midpoint)

  const handleStartMeditation = () => {
    startTimer()
    setStartedMeditation(true)
    console.log(`Starting ${meditation.title} meditation session with ${meditationTracks[selectedMusicTrack]?.name}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
      {/* Enhanced Floating Background with Morphing Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <div className={cn(
          'absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float-gentle',
          `bg-gradient-to-br ${theme.gradient}`
        )} style={{ animationDuration: '15s' }} />
        
        <div className={cn(
          'absolute bottom-32 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-15 animate-float-gentle',
          'bg-gradient-to-br from-purple-300 to-pink-300'
        )} style={{ animationDuration: '20s', animationDelay: '5s' }} />
        
        <div className={cn(
          'absolute top-1/2 right-20 w-64 h-64 rounded-full blur-2xl opacity-10 animate-float-gentle',
          'bg-gradient-to-br from-blue-300 to-cyan-300'
        )} style={{ animationDuration: '18s', animationDelay: '8s' }} />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-3 h-3 rounded-full opacity-30 animate-float-gentle',
              `bg-gradient-to-br ${theme.gradient}`
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 8}s`
            }}
          />
        ))}
      </div>
      
      {/* Background Music */}
      <BackgroundMusic 
        tracks={[meditationTracks[selectedMusicTrack]]} 
        autoPlay={isMusicPlaying} 
        defaultVolume={0.15} 
      />

      {/* Fixed Header Navigation */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm',
        'transition-all duration-500 transform',
        elementsVisible.header ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <AnimatedButton
              variant="secondary"
              onClick={onBack}
              className="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
              aria-label="Return to meditation selection"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Sessions</span>
            </AnimatedButton>

            <div className="flex items-center gap-4">
              <div className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-lg',
                'bg-gradient-to-r text-white shadow-lg border border-white/20',
                theme.gradient
              )}>
                <Clock className="w-4 h-4 inline mr-2" />
                {meditation.duration}
              </div>
              
              <div className={cn(
                'px-3 py-2 rounded-full text-xs font-medium',
                'bg-white/70 text-gray-600 border border-gray-200'
              )}>
                {meditation.category}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={cn(
        'relative z-10 pt-24 pb-16 text-center',
        'transition-all duration-800 transform',
        elementsVisible.hero ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
      )}>
        <div className="container mx-auto px-6">
          {/* Animated Icon with Glow Effect */}
          <div className="relative mb-8">
            <div className={cn(
              'text-8xl md:text-9xl inline-block relative z-10',
              'animate-pulse-gentle motion-reduce:animate-none'
            )}>
              {meditation.icon}
            </div>
            <div className={cn(
              'absolute inset-0 blur-2xl opacity-20 animate-pulse',
              `bg-gradient-to-br ${theme.gradient}`,
              'rounded-full scale-150'
            )} />
          </div>
          
          {/* Title with Gradient Text Animation */}
          <h1 className={cn(
            'text-5xl md:text-7xl font-black mb-6 leading-tight',
            'bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent',
            'animate-gradient-shift motion-reduce:animate-none'
          )} style={{ backgroundSize: '300% 100%' }}>
            {meditation.title}
          </h1>
          
          {/* Description with Typewriter Effect */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {meditation.description}
          </p>
        </div>
      </section>

      {/* Interactive Controls Hub */}
      <section className={cn(
        'relative z-10 pb-16',
        'transition-all duration-1000 transform',
        elementsVisible.controls ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      )}>
        <div className="container mx-auto px-6">
          
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-2 border border-white/40 shadow-xl">
              {(['timer', 'music', 'instructions'] as const).map((section, index) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={cn(
                    'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300',
                    'hover:scale-105 transform-gpu relative overflow-hidden',
                    activeSection === section
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {section === 'timer' && <Clock className="w-4 h-4" />}
                    {section === 'music' && <Music className="w-4 h-4" />}
                    {section === 'instructions' && <Heart className="w-4 h-4" />}
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </span>
                  
                  {/* Shimmer effect for active tab */}
                  {activeSection === section && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="max-w-6xl mx-auto">
            
            {/* Timer Section - Centrally Aligned & Prominently Displayed */}
            {activeSection === 'timer' && (
              <div className={cn(
                'bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-2xl',
                'transform transition-all duration-700 animate-slide-in-up',
                /* Container with subtle pastel gradient glow background */
                'bg-gradient-to-br from-pink-50/80 via-white/60 to-purple-50/80',
                'shadow-pink-200/30 hover:shadow-pink-300/40 transition-shadow duration-500'
              )}>
                
                {/* Main Timer Container - Perfect Center Alignment */}
                <div className={cn(
                  /* Flexbox container for perfect vertical and horizontal centering */
                  'flex flex-col items-center justify-center',
                  /* Responsive padding with balanced vertical spacing */
                  'px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24',
                  /* Minimum height to ensure proper vertical centering */
                  'min-h-[600px] sm:min-h-[700px]'
                )}>
                  
                  {/* Circular Timer with Numerical Display - Centered Container */}
                  <div className={cn(
                    /* Relative positioning for absolute elements inside */
                    'relative',
                    /* Flexbox for perfect centering of both circle and text */
                    'flex items-center justify-center',
                    /* Responsive sizing with consistent aspect ratio */
                    'w-80 h-80 sm:w-96 sm:h-96 lg:w-[400px] lg:h-[400px]',
                    /* Bottom margin for spacing from buttons */
                    'mb-12 sm:mb-16'
                  )}>
                    
                    {/* Progress Ring Circle - Positioned Behind Text */}
                    <div className={cn(
                      /* Absolute positioning to layer behind text */
                      'absolute inset-0',
                      /* Flexbox to center the SVG within the container */
                      'flex items-center justify-center'
                    )}>
                      <svg 
                        className="w-full h-full transform -rotate-90" 
                        viewBox="0 0 100 100"
                        style={{ filter: 'drop-shadow(0 4px 20px rgba(255, 111, 145, 0.2))' }}
                      >
                        {/* Background circle */}
                        <circle
                          cx="50" cy="50" r="45"
                          stroke="#FFF0F3"
                          strokeWidth="3"
                          fill="none"
                          className="opacity-60"
                        />
                        {/* Progress circle with pastel pink gradient */}
                        <circle
                          cx="50" cy="50" r="45"
                          stroke="url(#pinkGradient)"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${283 * (1 - timeRemaining / (parseInt(meditation.duration.match(/\d+/)?.[0] || '10') * 60))} 283`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF6F91" />
                            <stop offset="50%" stopColor="#FF8FAB" />
                            <stop offset="100%" stopColor="#FFB3C6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    {/* Timer Text - Centered Inside Circle */}
                    <div className={cn(
                      /* Z-index to appear above the circle */
                      'relative z-10',
                      /* Flexbox for perfect text centering */
                      'flex items-center justify-center',
                      /* Text styling with pastel pink color */
                      'text-6xl sm:text-7xl lg:text-8xl font-black font-mono',
                      /* Pastel pink color as requested (#FF6F91) */
                      'text-[#FF6F91]',
                      /* Smooth transitions for animations */
                      'transition-all duration-500',
                      /* Scale animation when timer is running */
                      isTimerRunning && 'animate-pulse-gentle scale-105',
                      /* Text shadow for better visibility */
                      'drop-shadow-sm'
                    )}>
                      {formatTime(timeRemaining)}
                    </div>
                    
                    {/* Status Indicators - Positioned Below Circle */}
                    {isTimerRunning && (
                      <div className={cn(
                        /* Absolute positioning below the circle */
                        'absolute -bottom-8 left-1/2 transform -translate-x-1/2',
                        /* Flexbox for horizontal centering of content */
                        'flex items-center justify-center gap-3',
                        /* Styling for status badge */
                        'px-6 py-3 bg-pink-50/90 backdrop-blur-sm rounded-full shadow-lg border border-pink-200/50'
                      )}>
                        <div className="w-3 h-3 rounded-full bg-[#FF6F91] animate-pulse" />
                        <span className="text-sm font-medium text-pink-700">Meditation Active</span>
                      </div>
                    )}
                    
                    {timeRemaining === 0 && (
                      <div className={cn(
                        /* Absolute positioning below the circle */
                        'absolute -bottom-8 left-1/2 transform -translate-x-1/2',
                        /* Flexbox for horizontal centering of content */
                        'flex items-center justify-center gap-3',
                        /* Styling for completion badge */
                        'px-6 py-3 bg-green-50/90 backdrop-blur-sm rounded-full shadow-lg border border-green-200/50'
                      )}>
                        <span className="text-2xl">🎉</span>
                        <span className="text-sm font-medium text-green-700">Session Complete!</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Timer Control Buttons - Horizontally Centered Below Timer */}
                  <div className={cn(
                    /* Flexbox for horizontal centering and even spacing */
                    'flex items-center justify-center gap-6 sm:gap-8',
                    /* Responsive flex direction - stack on very small screens */
                    'flex-col sm:flex-row',
                    /* Bottom margin for duration info */
                    'mb-8 sm:mb-10'
                  )}>
                    
                    {/* Primary Action Button - Start/Pause */}
                    {!isTimerRunning ? (
                      <AnimatedButton
                        variant="meditation"
                        color="pink"
                        size="xl"
                        onClick={startTimer}
                        className={cn(
                          /* Button sizing and spacing */
                          'flex items-center justify-center gap-3 px-10 py-4 sm:px-12 sm:py-5',
                          /* Typography */
                          'text-lg sm:text-xl font-bold',
                          /* Rounded corners as requested */
                          'rounded-2xl',
                          /* Enhanced shadow with pink theme */
                          'shadow-pink-200/50 hover:shadow-pink-300/60'
                        )}
                      >
                        <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                        Start Meditation
                      </AnimatedButton>
                    ) : (
                      <AnimatedButton
                        variant="secondary"
                        size="xl"
                        onClick={pauseTimer}
                        className={cn(
                          /* Button sizing and spacing */
                          'flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5',
                          /* Typography */
                          'text-lg font-semibold',
                          /* Rounded corners as requested */
                          'rounded-2xl'
                        )}
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </AnimatedButton>
                    )}
                    
                    {/* Secondary Action Button - Reset */}
                    <AnimatedButton
                      variant="secondary"
                      size="xl"
                      onClick={resetTimer}
                      className={cn(
                        /* Button sizing and spacing */
                        'flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5',
                        /* Typography */
                        'text-lg font-semibold',
                        /* Rounded corners as requested */
                        'rounded-2xl'
                      )}
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </AnimatedButton>
                  </div>
                  
                  {/* Duration Information - Centered Below Buttons */}
                  <div className={cn(
                    /* Text centering */
                    'text-center',
                    /* Typography styling */
                    'text-gray-600'
                  )}>
                    <p className="text-base sm:text-lg">
                      Duration: <span className="font-semibold text-[#FF6F91]">{selectedDuration}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Music Section */}
            {activeSection === 'music' && (
              <div className={cn(
                'bg-white/60 backdrop-blur-2xl rounded-3xl p-12 border border-white/40 shadow-2xl',
                'transform transition-all duration-700 animate-slide-in-up'
              )}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Soundscape</h2>
                  <p className="text-gray-600 text-lg">Select the perfect ambient music for your meditation</p>
                </div>
                
                {/* Music Track Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {meditationTracks.map((track, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMusicTrack(index)}
                      className={cn(
                        'p-6 rounded-2xl border-2 transition-all duration-300 group',
                        'hover:shadow-xl hover:scale-105 transform-gpu text-left',
                        selectedMusicTrack === index 
                          ? `${theme.accent} bg-gradient-to-br ${theme.lightGradient} border-current shadow-lg scale-105`
                          : 'border-gray-200 bg-white/70 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300',
                          selectedMusicTrack === index 
                            ? `bg-gradient-to-br ${theme.gradient} text-white`
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        )}>
                          <Music className="w-6 h-6" />
                        </div>
                        
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 transition-all duration-300',
                          selectedMusicTrack === index 
                            ? `bg-gradient-to-r ${theme.gradient} border-transparent scale-110`
                            : 'border-gray-300 group-hover:border-gray-400'
                        )} />
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{track.name}</h3>
                      <p className="text-sm text-gray-600">Ambient meditation music</p>
                    </button>
                  ))}
                </div>
                
                {/* Current Selection */}
                <div className={cn(
                  'p-8 rounded-2xl text-center text-white shadow-xl',
                  `bg-gradient-to-r ${theme.gradient}`
                )}>
                  <Music className="w-8 h-8 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Now Selected:</h3>
                  <p className="text-lg opacity-90">{meditationTracks[selectedMusicTrack]?.name}</p>
                  <p className="text-sm opacity-75 mt-2">
                    Music will {isMusicPlaying ? 'play' : 'start'} when you begin your meditation
                  </p>
                </div>
              </div>
            )}

            {/* Instructions Section */}
            {activeSection === 'instructions' && (
              <div className={cn(
                'transform transition-all duration-700 animate-slide-in-up'
              )}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Meditation Guide</h2>
                  <p className="text-gray-600 text-lg">Follow these steps for your {meditation.title.toLowerCase()} practice</p>
                </div>
                
                {/* Instructions Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Panel */}
                  <div className={cn(
                    'bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/40 shadow-2xl'
                  )}>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Preparation & Beginning</h3>
                    
                    <div className="space-y-4">
                      {leftPanelInstructions.map((instruction, index) => (
                        <div
                          key={index}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-2xl transition-all duration-500',
                            'bg-gradient-to-r hover:shadow-lg hover:scale-102 transform-gpu',
                            theme.lightGradient,
                            'animate-slide-in-up'
                          )}
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                            <span className="text-2xl animate-pulse-gentle motion-reduce:animate-none">
                              {instruction.split(' ')[0]}
                            </span>
                          </div>
                          
                          <div className="flex-1 pt-2">
                            <p className="text-gray-700 leading-relaxed font-medium">
                              {instruction.split(' ').slice(1).join(' ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className={cn(
                    'bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/40 shadow-2xl'
                  )}>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Deepening & Integration</h3>
                    
                    <div className="space-y-4">
                      {rightPanelInstructions.map((instruction, index) => (
                        <div
                          key={index}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-2xl transition-all duration-500',
                            'bg-gradient-to-r hover:shadow-lg hover:scale-102 transform-gpu',
                            theme.lightGradient,
                            'animate-slide-in-up'
                          )}
                          style={{ animationDelay: `${(index + leftPanelInstructions.length) * 150}ms` }}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                            <span className="text-2xl animate-pulse-gentle motion-reduce:animate-none">
                              {instruction.split(' ')[0]}
                            </span>
                          </div>
                          
                          <div className="flex-1 pt-2">
                            <p className="text-gray-700 leading-relaxed font-medium">
                              {instruction.split(' ').slice(1).join(' ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Bottom CTA */}
                <div className="text-center mt-12">
                  <AnimatedButton
                    variant="meditation"
                    color={meditation.color as any}
                    size="xl"
                    onClick={handleStartMeditation}
                    className="px-12 py-6 text-xl font-bold"
                  >
                    <Play className="w-6 h-6" />
                    Begin Your Journey
                  </AnimatedButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Success Modal for Started Meditation */}
      {startedMeditation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in-up">
          <div className={cn(
            'bg-white/95 backdrop-blur-2xl rounded-3xl p-12 max-w-md w-full text-center',
            'border border-white/60 shadow-2xl animate-slide-in-up transform-gpu'
          )}>
            <div className="text-8xl mb-6 animate-pulse-gentle">{meditation.icon}</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Meditation Started
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Your {meditation.title} session has begun. Find your center and let the journey unfold.
            </p>
            <AnimatedButton
              variant="meditation"
              color={meditation.color as any}
              onClick={() => setStartedMeditation(false)}
              className="w-full py-4 text-lg font-semibold"
            >
              Continue Practice
            </AnimatedButton>
          </div>
        </div>
      )}
    </div>
  )

}