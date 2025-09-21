import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation/Navigation'
import ChatWindow from '../components/Chat/ChatWindow'
import VRMAvatar from '../components/VRMAvatar/VRMAvatar_Simple'
import '../styles/dashboard-animations.css'

// Sound effect URLs (you can replace these with actual audio files)
const SOUNDS = {
  ambient: {
    rain: '/sounds/ambient-rain.mp3',
    forest: '/sounds/forest-sounds.mp3',
    meditation: '/sounds/meditation-bells.mp3',
    ocean: '/sounds/ocean-waves.mp3'
  },
  interaction: {
    messageSent: '/sounds/message-sent.mp3',
    messageReceived: '/sounds/message-received.mp3',
    typing: '/sounds/typing.mp3',
    notification: '/sounds/notification-chime.mp3'
  }
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [backgroundPhase, setBackgroundPhase] = useState(0)
  const [ambientSound, setAmbientSound] = useState<'rain' | 'forest' | 'meditation' | 'ocean' | 'none'>('meditation')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(0.3)
  const [showSoundControls, setShowSoundControls] = useState(false)
  
  // Extract context from URL parameters
  const chatContext = searchParams.get('context')
  
  // Audio refs
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Background color transition effect
  useEffect(() => {
    const backgroundTimer = setInterval(() => {
      setBackgroundPhase(prev => (prev + 1) % 6) // 6 different phases for variety
    }, 10000) // Change every 10 seconds for slower, more calming transitions
    return () => clearInterval(backgroundTimer)
  }, [])

  // Ambient sound management
  useEffect(() => {
    if (soundEnabled && ambientSound !== 'none') {
      // In a real app, you'd load actual audio files
      // For now, we'll simulate the sound system
      console.log(`Playing ambient sound: ${ambientSound} at volume ${volume}`)
      
      // Simulated audio setup
      if (ambientAudioRef.current) {
        ambientAudioRef.current.volume = volume
        ambientAudioRef.current.loop = true
        // ambientAudioRef.current.play().catch(console.log)
      }
    } else if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
    }
  }, [soundEnabled, ambientSound, volume])

  useEffect(() => {
    // Listen for chat events to update avatar state and play sounds
    const handleChatMessage = (event: any) => {
      const { message } = event.detail
      if (message.type === 'user') {
        // Play message sent sound
        playSound('messageSent')
        
        // Avatar state transitions
        setAvatarState('listening')
        setTimeout(() => {
          setAvatarState('thinking')
          playSound('typing') // Play thinking/processing sound
        }, 1000)
        setTimeout(() => {
          setAvatarState('speaking')
          playSound('messageReceived') // AI response sound
        }, 3000)
        setTimeout(() => setAvatarState('idle'), 6000)
      }
    }

    window.addEventListener('chatMessage', handleChatMessage)
    return () => window.removeEventListener('chatMessage', handleChatMessage)
  }, [])

  const playSound = (soundType: keyof typeof SOUNDS.interaction) => {
    if (!soundEnabled) return
    
    // In a real app, you'd play actual audio files
    console.log(`Playing sound: ${soundType}`)
    
    // Simulated sound feedback with visual cues
    if (soundType === 'messageSent') {
      // Could trigger a brief visual flash or animation
    }
  }

  const handleLogout = async () => {
    // Stop any playing sounds
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
    }
    await logout()
    navigate('/')
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) {
      return 'Good morning'
    }
    if (hour < 17) {
      return 'Good afternoon'
    }
    return 'Good evening'
  }

  const getBackgroundGradient = () => {
    const gradients = [
      'from-slate-900 via-indigo-900 to-slate-800',
      'from-indigo-900 via-purple-900 to-indigo-800', 
      'from-purple-900 via-pink-900 to-purple-800',
      'from-pink-900 via-teal-900 to-indigo-900',
      'from-teal-900 via-indigo-900 to-slate-900',
      'from-slate-800 via-purple-900 to-teal-900'
    ]
    return gradients[backgroundPhase]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500/20 border-t-teal-400 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-pink-400 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-200 text-lg font-medium">Preparing your therapy session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-10000 ease-in-out relative overflow-hidden`}>
      {/* Enhanced Animated Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        {/* Dynamic floating meditation elements */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-400 rounded-full mix-blend-soft-light filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-teal-400 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-32 right-32 w-88 h-88 bg-indigo-400 rounded-full mix-blend-soft-light filter blur-2xl animate-blob animation-delay-6000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-8000 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Enhanced Floating Meditation Icons */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 text-4xl text-pink-300/40 animate-float">💭</div>
        <div className="absolute top-1/3 right-1/4 text-3xl text-teal-300/40 animate-float animation-delay-2000">✨</div>
        <div className="absolute bottom-1/3 left-1/6 text-4xl text-purple-300/40 animate-float animation-delay-4000">🌙</div>
        <div className="absolute bottom-1/4 right-1/6 text-3xl text-indigo-300/40 animate-float animation-delay-6000">💫</div>
        <div className="absolute top-1/6 right-1/3 text-2xl text-pink-300/30 animate-float animation-delay-8000">🕊️</div>
        <div className="absolute bottom-1/6 left-1/3 text-3xl text-teal-300/30 animate-float animation-delay-10000">🧘‍♀️</div>
        <div className="absolute top-2/3 left-1/5 text-2xl text-purple-300/30 animate-float animation-delay-1000">🌸</div>
        <div className="absolute top-1/5 left-2/3 text-3xl text-indigo-300/30 animate-float animation-delay-3000">🌺</div>
      </div>

      {/* Sound Control Panel */}
      <div className={`fixed top-24 right-6 z-30 transition-all duration-500 ${showSoundControls ? 'translate-x-0' : 'translate-x-80'}`}>
        <div className="glass-card-dark rounded-2xl p-4 w-72 shadow-2xl border border-pink-400/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">🎵 Ambient Sounds</h3>
            <button
              onClick={() => setShowSoundControls(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">Enable Sounds</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-gradient-to-r from-pink-500 to-teal-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Volume Control */}
          <div className="mb-4">
            <label className="text-gray-300 text-sm mb-2 block">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Ambient Sound Selection */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm block">Ambient Sound</label>
            {['none', 'meditation', 'rain', 'forest', 'ocean'].map((sound) => (
              <button
                key={sound}
                onClick={() => setAmbientSound(sound as any)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  ambientSound === sound 
                    ? 'bg-gradient-to-r from-pink-500/30 to-teal-500/30 text-white border border-pink-400/50' 
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {sound === 'none' ? '� Silence' : 
                 sound === 'meditation' ? '🧘 Meditation Bells' :
                 sound === 'rain' ? '🌧️ Gentle Rain' :
                 sound === 'forest' ? '🌲 Forest Sounds' :
                 '🌊 Ocean Waves'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sound Control Trigger */}
      <button
        onClick={() => setShowSoundControls(true)}
        className="fixed top-24 right-6 z-20 glass-card-dark rounded-full w-12 h-12 flex items-center justify-center text-xl hover:scale-110 transition-transform shadow-xl"
      >
        🎵
      </button>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <main className="relative z-10 pt-20 h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Avatar Section */}
        <div className="w-full lg:w-2/5 p-4 lg:p-6 flex flex-col">
          {/* Avatar Header */}
          <div className="text-center mb-4 lg:mb-8 fadeInUp">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-pink-500/20 to-teal-500/20 backdrop-blur-md rounded-full px-4 lg:px-6 py-2 lg:py-3 mb-3 lg:mb-4 shadow-xl border border-pink-400/30">
              <span className="text-xl lg:text-2xl animate-bounce">🤖</span>
              <span className="text-base lg:text-lg font-semibold bg-gradient-to-r from-pink-300 to-teal-300 bg-clip-text text-transparent">
                MindCare AI Therapist
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
              {getGreeting()}, {user?.username || 'Friend'}!
            </h2>
            <p className="text-sm lg:text-base text-gray-300">I'm here to listen and support you</p>
          </div>

          {/* Avatar Display Area */}
          <div className="flex-1 flex items-center justify-center min-h-[200px] lg:min-h-0">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Outer Breathing Ring - Larger for better visibility */}
              <div className="absolute inset-0 w-64 lg:w-96 h-64 lg:h-96 rounded-full border-2 border-pink-400/20 animate-breathe animation-delay-1000 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute inset-0 w-72 lg:w-104 h-72 lg:h-104 rounded-full border border-teal-400/15 animate-breathe animation-delay-2000 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              
              {/* VRM Avatar Component - Larger container */}
              <VRMAvatar 
                avatarState={avatarState}
                className="w-64 lg:w-96 h-64 lg:h-96"
              />

              {/* Enhanced Floating Particles */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 lg:top-8 left-4 lg:left-8 w-2 lg:w-3 h-2 lg:h-3 bg-pink-400 rounded-full animate-float opacity-60"></div>
                <div className="absolute top-8 lg:top-16 right-6 lg:right-12 w-1.5 lg:w-2 h-1.5 lg:h-2 bg-teal-400 rounded-full animate-float animation-delay-1000 opacity-40"></div>
                <div className="absolute bottom-6 lg:bottom-12 left-8 lg:left-16 w-3 lg:w-4 h-3 lg:h-4 bg-purple-400 rounded-full animate-float animation-delay-2000 opacity-50"></div>
                <div className="absolute bottom-4 lg:bottom-8 right-4 lg:right-8 w-1.5 lg:w-2 h-1.5 lg:h-2 bg-indigo-400 rounded-full animate-float animation-delay-3000 opacity-60"></div>
                <div className="absolute top-12 lg:top-20 left-12 lg:left-20 w-2 lg:w-3 h-2 lg:h-3 bg-pink-300 rounded-full animate-float animation-delay-4000 opacity-30"></div>
                <div className="absolute bottom-8 lg:bottom-16 right-12 lg:right-20 w-2 lg:w-3 h-2 lg:h-3 bg-teal-300 rounded-full animate-float animation-delay-5000 opacity-40"></div>
              </div>

              {/* Meditation Energy Waves */}
              <div className={`absolute inset-0 ${avatarState === 'thinking' || avatarState === 'speaking' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
                <div className="absolute inset-0 w-52 lg:w-84 h-52 lg:h-84 rounded-full border border-pink-400/20 animate-ping animation-delay-500"></div>
                <div className="absolute inset-0 w-56 lg:w-88 h-56 lg:h-88 rounded-full border border-teal-400/15 animate-ping animation-delay-1000"></div>
                <div className="absolute inset-0 w-60 lg:w-92 h-60 lg:h-92 rounded-full border border-purple-400/10 animate-ping animation-delay-1500"></div>
              </div>
            </div>
          </div>

          {/* Avatar Status */}
          <div className="text-center mt-4 lg:mt-8">
            <div className="glass-card-dark rounded-2xl p-3 lg:p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${avatarState === 'idle' ? 'bg-gray-400' : avatarState === 'listening' ? 'bg-green-400 animate-pulse' : avatarState === 'thinking' ? 'bg-yellow-400 animate-bounce' : 'bg-blue-400 animate-ping'}`}></div>
                <span className="text-gray-300 font-medium text-sm lg:text-base">
                  {avatarState === 'idle' ? 'Ready to help' :
                   avatarState === 'listening' ? 'Listening carefully...' :
                   avatarState === 'thinking' ? 'Processing your message...' :
                   'Responding with care...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="w-full lg:w-3/5 p-4 lg:p-6 flex flex-col min-h-[50vh] lg:min-h-0">
          <div className="h-full glass-card-dark rounded-3xl overflow-hidden shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 lg:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-white">Therapy Session</h3>
                  <p className="text-gray-400 text-xs lg:text-sm">Safe, private, and confidential</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs lg:text-sm text-gray-300">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow context={chatContext || undefined} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}