import { useRef, useState } from 'react'
import { useVrmAvatar } from '../../hooks/useVrmAvatar'

/**
 * Example component demonstrating VRM Lip Sync integration
 * This shows how to connect Murf TTS audio with VRM lip synchronization
 */
export default function VrmLipSyncExample() {
  const { 
    canvasRef, 
    currentEmotion, 
    isLoading,
    switchToEmotion,
    setupLipSync,
    startLipSync,
    stopLipSync,
    isLipSyncActive
  } = useVrmAvatar()

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isLipSyncSetup, setIsLipSyncSetup] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')

  // Example Murf TTS audio URL (you would get this from your Murf TTS service)
  const handleSetupLipSync = async () => {
    if (!audioRef.current) return

    const success = await setupLipSync(audioRef.current)
    if (success) {
      setIsLipSyncSetup(true)
      console.log('✅ Lip sync setup completed')
    } else {
      console.error('❌ Failed to setup lip sync')
    }
  }

  const handlePlayAudio = () => {
    if (!audioRef.current || !isLipSyncSetup) return

    // Start lip sync before playing audio
    startLipSync()
    audioRef.current.play()
  }

  const handleStopAudio = () => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    stopLipSync()
  }

  // Handle audio events
  const handleAudioPlay = () => {
    if (isLipSyncSetup) {
      startLipSync()
    }
  }

  const handleAudioPause = () => {
    stopLipSync()
  }

  const handleAudioEnded = () => {
    stopLipSync()
  }

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      {/* VRM Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-xl">Loading VRM Avatar...</div>
        </div>
      )}

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-4">VRM Lip Sync Demo</h2>
        
        {/* Emotion Controls */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Emotion: {currentEmotion}</h3>
          <div className="grid grid-cols-3 gap-2">
            {['neutral', 'happy', 'sad', 'concerned', 'supportive', 'excited'].map((emotion) => (
              <button
                key={emotion}
                onClick={() => switchToEmotion(emotion as any)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                disabled={isLoading}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        {/* Audio URL Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Murf TTS Audio URL:
          </label>
          <input
            type="url"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        {/* Lip Sync Setup */}
        <div className="mb-4">
          <button
            onClick={handleSetupLipSync}
            disabled={!audioUrl || isLipSyncSetup}
            className={`w-full px-4 py-2 rounded font-medium ${
              isLipSyncSetup 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isLipSyncSetup ? '✅ Lip Sync Ready' : '⚙️ Setup Lip Sync'}
          </button>
        </div>

        {/* Audio Controls */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePlayAudio}
              disabled={!isLipSyncSetup || !audioUrl}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              ▶️ Play & Sync
            </button>
            <button
              onClick={handleStopAudio}
              disabled={!isLipSyncSetup}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              ⏹️ Stop
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="text-sm">
          <div className="mb-1">
            <span className="font-medium">Lip Sync Status:</span>{' '}
            <span className={isLipSyncActive() ? 'text-green-400' : 'text-gray-400'}>
              {isLipSyncActive() ? '🎤 Speaking' : '😐 Idle'}
            </span>
          </div>
          <div>
            <span className="font-medium">Setup:</span>{' '}
            <span className={isLipSyncSetup ? 'text-green-400' : 'text-yellow-400'}>
              {isLipSyncSetup ? 'Ready' : 'Not configured'}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 pt-4 border-t border-gray-600 text-xs text-gray-300">
          <h4 className="font-medium mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter a Murf TTS audio URL</li>
            <li>Click "Setup Lip Sync" to initialize audio analysis</li>
            <li>Choose an emotion for the avatar</li>
            <li>Click "Play & Sync" to start audio with lip sync</li>
          </ol>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onEnded={handleAudioEnded}
          preload="auto"
          style={{ display: 'none' }}
        />
      )}
    </div>
  )
}