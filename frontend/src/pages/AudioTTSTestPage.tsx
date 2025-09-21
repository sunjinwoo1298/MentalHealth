import { useState } from 'react';
import AudioTTSChat from '../components/Chat/AudioTTSChat';
import Navigation from '../components/Navigation/Navigation';

export default function AudioTTSTestPage() {
  const [audioStats, setAudioStats] = useState({
    totalMessages: 0,
    audioPlayed: 0,
    currentProvider: '',
    currentVoice: '',
    currentEmotion: ''
  });

  const handleMessage = () => {
    setAudioStats(prev => ({
      ...prev,
      totalMessages: prev.totalMessages + 1
    }));
  };

  const handleAudioPlay = (audioData: any) => {
    if (audioData) {
      setAudioStats(prev => ({
        ...prev,
        audioPlayed: prev.audioPlayed + 1,
        currentProvider: audioData.provider || '',
        currentVoice: audioData.voice_profile || '',
        currentEmotion: audioData.emotion_context || ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎙️ Voice-Enabled Mental Health Chat
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our AI companion with natural voice responses powered by Murf.ai. 
            Get empathetic support with culturally sensitive, high-quality speech synthesis.
          </p>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-blue-600">{audioStats.totalMessages}</div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-green-600">{audioStats.audioPlayed}</div>
            <div className="text-sm text-gray-600">Audio Played</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-lg font-semibold text-purple-600">
              {audioStats.currentProvider || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">TTS Provider</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-sm font-medium text-orange-600">
              {audioStats.currentVoice || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Voice Profile</div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Component */}
          <div className="lg:col-span-2">
            <AudioTTSChat
              className="h-[600px]"
              onMessage={handleMessage}
              onAudioPlay={handleAudioPlay}
            />
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🌟 Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Natural voice synthesis with Murf.ai</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Emotion-aware voice modulation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Cultural sensitivity for Indian context</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Multiple voice profiles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Privacy-first design</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Real-time audio playback</span>
                </li>
              </ul>
            </div>

            {/* Voice Profiles */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎭 Available Voices</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-pink-50 rounded">
                  <div className="font-medium text-pink-700">Compassionate Female</div>
                  <div className="text-pink-600">Warm, empathetic tone for supportive conversations</div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium text-blue-700">Empathetic Male</div>
                  <div className="text-blue-600">Gentle, understanding voice for guidance</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="font-medium text-green-700">Gentle Female</div>
                  <div className="text-green-600">Soft, calming presence for anxiety relief</div>
                </div>
              </div>
            </div>

            {/* Current Session */}
            {audioStats.currentProvider && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎵 Current Session</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{audioStats.currentProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voice:</span>
                    <span className="font-medium">{audioStats.currentVoice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emotion:</span>
                    <span className="font-medium">{audioStats.currentEmotion}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm">
                <li>• Ask about stress, anxiety, or mental wellness</li>
                <li>• Try different emotions in your messages</li>
                <li>• Click "Play Audio" to replay responses</li>
                <li>• Enjoy the natural voice experience!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}