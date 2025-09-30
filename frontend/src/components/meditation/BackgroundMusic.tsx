/**
 * BackgroundMusic Component
 * 
 * Purpose: Ambient music player with volume controls
 * Features:
 * - Auto-plays calm ambient music on mount
 * - Fixed position controls at bottom of screen
 * - Mute/unmute toggle with visual feedback
 * - Volume slider control
 * - Multiple track selection
 * - Fade in/out transitions between tracks
 * 
 * Props:
 * - tracks: array of music track objects with src and name
 * - autoPlay: boolean to auto-start music (default: true)
 * - defaultVolume: initial volume level (0-1, default: 0.3)
 * 
 * State Management:
 * - isPlaying: tracks play state
 * - currentTrack: active track index
 * - volume: current volume level
 * - isMuted: mute state
 * 
 * Accessibility Notes:
 * - ARIA labels for screen readers
 * - Keyboard navigation support
 * - Visual indicators for audio state
 */

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Track {
  src: string
  name: string
}

interface BackgroundMusicProps {
  tracks?: Track[]
  autoPlay?: boolean
  defaultVolume?: number
}

export default function BackgroundMusic({ 
  tracks = [], 
  autoPlay = true, 
  defaultVolume = 0.3 
}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const failedSrcsRef = useRef<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [volume, setVolume] = useState(defaultVolume)
  const [isMuted, setIsMuted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Default tracks if none provided
  const defaultTracks: Track[] = [
    { 
      src: 'https://www.soundjay.com/misc/sounds/zen-garden.mp3', 
      name: 'Zen Garden' 
    },
    { 
      src: 'https://www.soundjay.com/nature/sounds/forest-with-small-river.mp3', 
      name: 'Forest Stream' 
    },
    { 
      src: 'https://www.soundjay.com/nature/sounds/ocean-waves.mp3', 
      name: 'Ocean Waves' 
    }
  ]

  const activeTracks = tracks.length > 0 ? tracks : defaultTracks
  const currentTrack = activeTracks[currentTrackIndex]

  // Keep internal play state in sync when parent toggles autoPlay (e.g., on Start)
  useEffect(() => {
    setIsPlaying(Boolean(autoPlay))
  }, [autoPlay])

  // Reload audio ONLY when the actual track URL changes to avoid restart loops
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    // React will update the src attribute; just call load
    audio.load()
  }, [currentTrack?.src])

  // Reset failed tracks when the provided track list identity changes
  useEffect(() => {
    failedSrcsRef.current.clear()
  }, [tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    audio.volume = isMuted ? 0 : volume
    audio.loop = true

    if (isPlaying && currentTrack) {
      // Fade in effect
      audio.volume = 0
      audio.play().catch(() => {
        // Handle autoplay restrictions
        setIsPlaying(false)
      })
      
      const fadeIn = setInterval(() => {
        if (audio.volume < (isMuted ? 0 : volume)) {
          audio.volume = Math.min(audio.volume + 0.05, isMuted ? 0 : volume)
        } else {
          clearInterval(fadeIn)
        }
      }, 100)

      return () => clearInterval(fadeIn)
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, volume, isMuted])

  useEffect(() => {
    // Show controls after a brief delay
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % activeTracks.length)
  }

  if (activeTracks.length === 0) {
    return null
  }

  return (
    <>
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        preload="metadata"
        aria-label={`Currently playing: ${currentTrack?.name}`}
        onCanPlay={() => {
          const audio = audioRef.current
          if (!audio) {
            return
          }
          if (isPlaying) {
            // Ensure play resumes after source/load changes
            audio.play().catch(() => setIsPlaying(false))
          }
        }}
        onError={() => {
          // If a track fails to load, attempt the next track once per unique src
          const src = currentTrack?.src
          if (src) {
            failedSrcsRef.current.add(src)
          }

          const attemptedAll = failedSrcsRef.current.size >= activeTracks.length

          if (!attemptedAll && activeTracks.length > 1) {
            setCurrentTrackIndex((prev) => (prev + 1) % activeTracks.length)
          } else {
            // Stop playback after trying all available tracks
            setIsPlaying(false)
          }
        }}
      />

      {/* Fixed controls at bottom */}
      <div 
        className={cn(
          'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50',
          'bg-white/80 backdrop-blur-md rounded-full px-6 py-3',
          'border border-white/60 shadow-lg',
          'flex items-center gap-4',
          'transition-all duration-500 ease-out',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        )}
        role="region"
        aria-label="Background music controls"
      >
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:scale-110 transition-transform duration-200"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Track info */}
        <div className="hidden sm:block">
          <div className="text-sm font-medium text-gray-700">
            {currentTrack?.name || 'Ambient Music'}
          </div>
          <div className="text-xs text-gray-500">
            Meditation Background
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label="Volume control"
          />
        </div>

        {/* Next Track */}
        {activeTracks.length > 1 && (
          <button
            onClick={nextTrack}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        )}
      </div>


    </>
  )
}