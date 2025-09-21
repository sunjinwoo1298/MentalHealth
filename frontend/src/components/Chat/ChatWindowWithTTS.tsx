import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useVrmAvatar } from '../../hooks/useVrmAvatar';
import { useAudioTTS } from '../../hooks/useAudioTTS';
import { EmotionControls } from '../VrmControls';
import { useGamification } from '../../contexts/GamificationContext';

export type ChatMessage = {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  userId?: string;
  audioUrl?: string;
  ttsData?: {
    provider: string;
    voice_profile: string;
    emotion_context: string;
    duration_seconds: number;
  };
};

const systemWelcome: ChatMessage = {
  id: 'system-welcome',
  type: 'system',
  text: 'Welcome to MindCare AI! You can now experience voice responses. All conversations are private and secure.',
  timestamp: new Date().toISOString(),
};

// Initialize socket outside the component to avoid multiple connections
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  secure: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function ChatWindowWithTTS() {
  const [messages, setMessages] = useState<ChatMessage[]>([systemWelcome]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<Date | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [useDirectTTS, setUseDirectTTS] = useState(true); // Toggle for TTS mode
  const [audioError, setAudioError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Gamification integration
  const { addPendingReward } = useGamification();

  // VRM Avatar integration
  const {
    canvasRef,
    currentEmotion,
    isLoading: vrmLoading,
    isTransitioning,
    switchToEmotion,
  } = useVrmAvatar();

  // Simple emotion updater (fallback)
  const updateAvatarEmotion = (text: string, type: 'user' | 'ai') => {
    // Simple emotion detection based on keywords
    const emotions: { [key: string]: any } = {
      'happy': ['good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic'],
      'sad': ['sad', 'depressed', 'down', 'upset', 'crying', 'tears'],
      'angry': ['angry', 'mad', 'frustrated', 'annoyed', 'furious'],
      'surprised': ['wow', 'amazing', 'incredible', 'unbelievable', 'shocking'],
      'relaxed': ['calm', 'peaceful', 'relaxed', 'meditation', 'breathe']
    };

    const lowerText = text.toLowerCase();
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some((keyword: string) => lowerText.includes(keyword))) {
        switchToEmotion(emotion as any);
        return;
      }
    }
    
    // Default emotions based on type
    if (type === 'user') {
      switchToEmotion('neutral');
    } else {
      switchToEmotion('happy');
    }
  };

  // Audio TTS integration
  const {
    isLoading: ttsLoading,
    isPlaying: audioPlaying,
    sendMessage: sendTTSMessage,
    lastResponse,
    replayLastAudio,
    stopAudio
  } = useAudioTTS({
    backendUrl: 'http://localhost:5010',
    autoPlay: true,
    onAudioStart: () => {
      setAudioError(null);
      // Switch avatar to speaking emotion
      switchToEmotion('happy');
    },
    onAudioEnd: () => {
      // Return avatar to neutral
      switchToEmotion('neutral');
    },
    onError: (error) => {
      setAudioError(error);
      console.error('TTS Error:', error);
    }
  });

  useEffect(() => {
    // Connect to socket for real-time features (if needed)
    if (!useDirectTTS) {
      socket.connect();

      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
        setIsConnected(true);
        setChatStartTime(new Date());
        setMessageCount(0);
        socket.emit('join_room', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        
        if (chatStartTime && messageCount >= 3) {
          const sessionDuration = Date.now() - chatStartTime.getTime();
          const durationMinutes = Math.floor(sessionDuration / (1000 * 60));
          
          addPendingReward('chat_completion', {
            messageCount,
            durationMinutes,
            sessionId: socket.id,
            completedAt: new Date().toISOString()
          });
        }
      });

      socket.on('chat:message', (msg: ChatMessage) => {
        console.log('Received message:', msg);
        setMessages((prev) => [...prev, msg]);
        setIsTyping(false);
        
        if (msg.type === 'user') {
          setMessageCount(prev => prev + 1);
        }
        
        updateAvatarEmotion(msg.text, msg.type as 'user' | 'ai');
      });

      socket.on('chat:typing', (typing: boolean) => {
        setIsTyping(typing);
        if (typing) {
          switchToEmotion('neutral');
        }
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('chat:message');
        socket.off('chat:typing');
        socket.disconnect();
      };
    } else {
      // For direct TTS mode, just set connected state
      setIsConnected(true);
      setChatStartTime(new Date());
    }
  }, [useDirectTTS]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || (!isConnected && !useDirectTTS)) {
      return;
    }

    const messageText = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
      userId: socket.id || 'direct-user',
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMsg]);
    updateAvatarEmotion(messageText, 'user');
    setInput('');
    setMessageCount(prev => prev + 1);

    if (useDirectTTS) {
      // Use direct TTS backend
      setIsTyping(true);
      
      try {
        const response = await sendTTSMessage(messageText, userMsg.userId || 'web-user');
        
        if (response) {
          console.log('TTS Response received:', response);
          console.log('TTS Data:', response.tts);
          console.log('Audio filename:', response.tts?.audio_filename);
          
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            text: response.response,
            timestamp: new Date().toISOString(),
            audioUrl: response.tts?.audio_filename ? `http://localhost:5010/audio/${response.tts.audio_filename}` : undefined,
            ttsData: response.tts ? {
              provider: response.tts.provider,
              voice_profile: response.voice_profile || response.tts.voice_profile,
              emotion_context: response.emotion_context || response.tts.emotion_context,
              duration_seconds: response.tts.duration_seconds
            } : undefined
          };

          console.log('AI Message created:', aiMsg);
          setMessages((prev) => [...prev, aiMsg]);
          updateAvatarEmotion(response.response, 'ai');
        } else {
          // Fallback message
          const errorMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            type: 'ai',
            text: 'I apologize, but I encountered a technical issue. Please try again.',
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setAudioError('Failed to send message');
      } finally {
        setIsTyping(false);
      }
    } else {
      // Use socket.io
      socket.emit('chat:message', userMsg);
    }
  };

  const replayMessageAudio = (message: ChatMessage) => {
    if (message.audioUrl) {
      // For URL-based audio
      const audio = new Audio(message.audioUrl);
      audio.play().catch(error => {
        console.error('Audio replay error:', error);
        setAudioError('Could not replay audio');
      });
    } else if (lastResponse && message.id.includes('ai')) {
      // For the last TTS response
      replayLastAudio();
    }
  };

  return (
    <div className="h-full relative bg-transparent overflow-hidden">
      {/* VRM Avatar Background */}
      <div className="absolute inset-0">
        <canvas 
          ref={canvasRef}
          className="w-full h-full bg-transparent block"
        />
        
        {vrmLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <span className="text-sm">Loading Avatar...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Overlay */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Controls - Top */}
        <div className="flex justify-between items-start p-4 pointer-events-auto">
          <EmotionControls 
            currentEmotion={currentEmotion}
            isLoading={vrmLoading}
            onEmotionChange={switchToEmotion}
            isTransitioning={isTransitioning}
          />

          {/* TTS Mode Toggle & Status */}
          <div className="bg-black/70 text-white rounded-lg p-3 text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useDirectTTS}
                  onChange={(e) => setUseDirectTTS(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Voice Mode</span>
              </label>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {useDirectTTS && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${audioPlaying ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>{audioPlaying ? 'Playing Audio' : 'Audio Ready'}</span>
                  </div>
                  
                  {audioError && (
                    <div className="text-red-300">⚠️ {audioError}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages - Bottom Half */}
        <div className="flex-1 flex flex-col justify-end pointer-events-auto">
          <div className="max-h-96 overflow-y-auto bg-black/30 backdrop-blur-sm mx-4 rounded-t-lg">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'ai'
                        ? 'bg-white/90 text-gray-800'
                        : 'bg-yellow-500/90 text-gray-800'
                    }`}
                  >
                    <p>{message.text}</p>
                    
                    {/* Audio controls for AI messages */}
                    {message.type === 'ai' && useDirectTTS && (message.audioUrl || message.ttsData) && (
                      <div className="mt-2 flex items-center space-x-2">
                        <button
                          onClick={() => replayMessageAudio(message)}
                          disabled={audioPlaying}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 flex items-center space-x-1"
                        >
                          <span>🔊</span>
                          <span>{audioPlaying ? 'Playing...' : 'Play Audio'}</span>
                        </button>
                        
                        {/* Test direct URL button */}
                        {message.audioUrl && (
                          <button
                            onClick={() => {
                              console.log('Testing direct audio URL:', message.audioUrl);
                              const audio = new Audio(message.audioUrl);
                              audio.play().then(() => {
                                console.log('Direct audio play successful');
                              }).catch(err => {
                                console.error('Direct audio play failed:', err);
                              });
                            }}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center space-x-1"
                          >
                            <span>🎵</span>
                            <span>Test URL</span>
                          </button>
                        )}
                        
                        {message.ttsData && (
                          <div className="text-xs text-gray-600">
                            {message.ttsData.provider} • {message.ttsData.duration_seconds.toFixed(1)}s
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {(isTyping || ttsLoading) && (
                <div className="flex justify-start">
                  <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>{ttsLoading ? 'AI is thinking...' : 'Typing...'}</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="bg-black/30 backdrop-blur-sm mx-4 rounded-b-lg p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={useDirectTTS ? "Type a message... (with voice response)" : "Type a message..."}
                disabled={!isConnected || ttsLoading}
                className="flex-1 px-3 py-2 bg-white/90 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isConnected || !input.trim() || ttsLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {useDirectTTS ? (
                  <>
                    <span>🎤</span>
                    <span>{ttsLoading ? 'Sending...' : 'Send'}</span>
                  </>
                ) : (
                  <>
                    <span>💬</span>
                    <span>Send</span>
                  </>
                )}
              </button>
              
              {audioPlaying && (
                <button
                  onClick={stopAudio}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                  title="Stop Audio"
                >
                  <span>🔇</span>
                </button>
              )}
            </div>
            
            {useDirectTTS && (
              <p className="text-xs text-white/70 mt-2 text-center">
                🔊 Voice responses powered by Murf.ai • Secure & Private
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}