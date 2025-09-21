import React, { useEffect, useRef, useState } from 'react';
import { useVrmAvatar } from '../../hooks/useVrmAvatar';
import { useGamification } from '../../contexts/GamificationContext';
import { useAudioTTS } from '../../hooks/useAudioTTS';

export type ChatMessage = {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  userId?: string;
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
  text: 'You are now connected to MindCare AI with voice responses. Audio is processed in your browser for privacy. All conversations are secure.',
  timestamp: new Date().toISOString(),
};

export default function ChatWindowTTS() {
  const [messages, setMessages] = useState<ChatMessage[]>([systemWelcome]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<Date | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Refs to track values for cleanup without dependency issues
  const chatStartTimeRef = useRef<Date | null>(null);
  const messageCountRef = useRef<number>(0);

  // Gamification integration
  const { addPendingReward } = useGamification();

  // VRM Avatar integration
  const {
    canvasRef,
    isLoading: vrmLoading,
    isTransitioning,
    switchToEmotion
  } = useVrmAvatar();

  // Audio TTS integration
  const {
    isLoading: ttsLoading,
    sendMessage: sendTTSMessage,
  } = useAudioTTS({
    backendUrl: 'http://localhost:5010',
    autoPlay: true,
    onAudioStart: () => {
      switchToEmotion('happy');
    },
    onAudioEnd: () => {
      switchToEmotion('neutral');
    },
  });

  // Auto-switch avatar emotions based on conversation
  const updateAvatarEmotion = (messageText: string, messageType: 'user' | 'ai') => {
    if (vrmLoading || isTransitioning) {
      return;
    }

    const text = messageText.toLowerCase();
    
    if (messageType === 'ai') {
      switchToEmotion('neutral');
    } else if (messageType === 'user') {
      if (text.includes('sad') || text.includes('depressed') || text.includes('down')) {
        switchToEmotion('neutral');
      } else if (text.includes('angry') || text.includes('frustrated') || text.includes('mad')) {
        switchToEmotion('neutral');
      } else if (text.includes('happy') || text.includes('good') || text.includes('great')) {
        switchToEmotion('neutral');
      } else {
        switchToEmotion('neutral');
      }
    }
  };

  useEffect(() => {
    // Set as connected for TTS mode - only run once on mount
    setIsConnected(true);
    const startTime = new Date();
    setChatStartTime(startTime);
    setMessageCount(0);
    
    // Update refs for cleanup
    chatStartTimeRef.current = startTime;
    messageCountRef.current = 0;
  }, []); // Empty dependency array - run only on mount

  // Update refs when state changes
  useEffect(() => {
    chatStartTimeRef.current = chatStartTime;
    messageCountRef.current = messageCount;
  }, [chatStartTime, messageCount]);

  // Separate effect for cleanup handling
  useEffect(() => {
    return () => {
      // Cleanup function for gamification tracking using refs
      if (chatStartTimeRef.current && messageCountRef.current >= 3) {
        const sessionDuration = Date.now() - chatStartTimeRef.current.getTime();
        const durationMinutes = Math.floor(sessionDuration / (1000 * 60));
        
        addPendingReward('chat_completion', {
          messageCount: messageCountRef.current,
          durationMinutes,
          sessionId: 'tts-session',
          completedAt: new Date().toISOString()
        });
      }
    };
  }, []); // Empty dependency - cleanup only on unmount

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }
    
    const messageText = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
      userId: 'tts-user',
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMsg]);
    
    // Update avatar emotion based on user message
    updateAvatarEmotion(messageText, 'user');
    setInput('');
    setMessageCount(prev => prev + 1);

    // Use TTS backend for AI response
    setIsTyping(true);
    
    try {
      const response = await sendTTSMessage(messageText, userMsg.userId || 'web-user');
      
      if (response) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          text: response.response,
          timestamp: new Date().toISOString(),
          ttsData: response.tts ? {
            provider: response.tts.provider,
            voice_profile: response.voice_profile || response.tts.voice_profile,
            emotion_context: response.emotion_context || response.tts.emotion_context,
            duration_seconds: response.tts.duration_seconds
          } : undefined
        };

        setMessages((prev) => [...prev, aiMsg]);
        updateAvatarEmotion(response.response, 'ai');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback error message
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        text: 'I apologize, but I encountered a technical issue. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full relative bg-transparent overflow-hidden">
      {/* VRM Avatar Background */}
      <div className="absolute inset-0">
        <canvas 
          ref={canvasRef}
          className="w-full h-full bg-transparent"
        />
        
        {vrmLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg">Loading your 3D companion...</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat UI Overlay */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top Status Bar */}
        <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-white text-sm">
              {isConnected ? 'Connected with Voice' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%]">
                {message.type !== 'user' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <span className="text-white/90 text-sm drop-shadow-lg">MindCare AI</span>
                  </div>
                )}
                
                <div
                  className={`px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500/80 to-cyan-600/80 text-white border-blue-300/30'
                      : message.type === 'ai'
                      ? 'bg-gradient-to-r from-purple-500/80 to-indigo-600/80 text-white border-purple-300/30'
                      : 'bg-gradient-to-r from-yellow-500/80 to-orange-600/80 text-white border-yellow-300/30'
                  }`}
                >
                  <p className="text-sm drop-shadow-sm leading-relaxed">{message.text}</p>
                  
                  {/* Voice indicator for AI messages */}
                  {message.type === 'ai' && message.ttsData && (
                    <div className="mt-2 text-xs opacity-75">
                      🎵 Voice: {message.ttsData.provider} • {message.ttsData.duration_seconds.toFixed(1)}s
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {(isTyping || ttsLoading) && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <span className="text-white/90 text-sm drop-shadow-lg">MindCare AI</span>
                </div>
                <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500/80 to-indigo-600/80 text-white shadow-xl backdrop-blur-md border border-purple-300/30">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                    <span className="text-sm drop-shadow-sm">
                      {ttsLoading ? 'Preparing voice response...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-black/20 backdrop-blur-sm">
          <form onSubmit={sendMessage} className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share what's on your mind... (with voice response)"
                disabled={!isConnected || ttsLoading}
                className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || !isConnected || ttsLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {ttsLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
            
            <div className="text-center text-white/60 text-xs">
              🎤 Voice responses in browser cache • No files stored on device • Private & secure
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}