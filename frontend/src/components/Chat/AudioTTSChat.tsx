import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  audioUrl?: string;
  audioBase64?: string;
  ttsData?: {
    provider: string;
    voice_profile: string;
    emotion_context: string;
    duration_seconds: number;
  };
}

interface AudioTTSChatProps {
  className?: string;
  onMessage?: (message: ChatMessage) => void;
  onAudioPlay?: (audioData: any) => void;
}

// Backend URL - adjust this to match your Python backend
const BACKEND_URL = 'http://localhost:5010';

export default function AudioTTSChat({ className = '', onMessage, onAudioPlay }: AudioTTSChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onloadstart = () => setIsPlaying(true);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = (e) => {
      console.error('Audio playback error:', e);
      setAudioError('Audio playback failed');
      setIsPlaying(false);
    };
    audioRef.current.onloadeddata = () => setAudioError(null);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play audio from base64 or URL
  const playAudio = useCallback(async (audioBase64?: string, audioUrl?: string) => {
    if (!audioRef.current) return;

    try {
      setIsPlaying(true);
      setAudioError(null);

      if (audioBase64) {
        // Play from base64 data
        const audioBlob = new Blob(
          [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], 
          { type: 'audio/mpeg' }
        );
        const audioObjectUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioObjectUrl;
        
        // Cleanup object URL after use
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioObjectUrl);
        };
      } else if (audioUrl) {
        // Play from URL
        audioRef.current.src = audioUrl;
      } else {
        setIsPlaying(false);
        return;
      }

      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError('Could not play audio');
      setIsPlaying(false);
    }
  }, []);

  // Send message to backend
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    onMessage?.(userMessage);
    
    const messageText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Call the Python backend chat endpoint
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          userId: 'web-user-' + Date.now(),
          voicePreference: 'female' // or get from user preferences
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);

      // Create AI message
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        text: data.response,
        timestamp: new Date(),
        audioBase64: data.tts?.audio_base64,
        audioUrl: data.tts?.audio_filename ? `${BACKEND_URL}/audio/${data.tts.audio_filename}` : undefined,
        ttsData: data.tts ? {
          provider: data.tts.provider,
          voice_profile: data.voice_profile || data.tts.voice_profile,
          emotion_context: data.emotion_context || data.tts.emotion_context,
          duration_seconds: data.tts.duration_seconds
        } : undefined
      };

      // Add AI message
      setMessages(prev => [...prev, aiMessage]);
      onMessage?.(aiMessage);

      // Play audio if available
      if (aiMessage.audioBase64 || aiMessage.audioUrl) {
        onAudioPlay?.(aiMessage.ttsData);
        setTimeout(() => {
          playAudio(aiMessage.audioBase64, aiMessage.audioUrl);
        }, 500); // Small delay to let UI update
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Replay audio for a message
  const replayAudio = (message: ChatMessage) => {
    if (message.audioBase64 || message.audioUrl) {
      playAudio(message.audioBase64, message.audioUrl);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">MindCare AI Assistant</h2>
        <p className="text-sm opacity-90">
          Voice-enabled mental health support • {isPlaying ? '🔊 Playing...' : '🎤 Ready'}
        </p>
        {audioError && (
          <p className="text-red-200 text-xs mt-1">⚠️ {audioError}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>Start a conversation with your AI companion</p>
            <p className="text-sm">Responses include natural voice synthesis</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-md rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              
              {/* Audio controls for AI messages */}
              {message.type === 'ai' && (message.audioBase64 || message.audioUrl) && (
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => replayAudio(message)}
                    disabled={isPlaying}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <span>🔊</span>
                    <span>{isPlaying ? 'Playing...' : 'Play Audio'}</span>
                  </button>
                  
                  {message.ttsData && (
                    <div className="text-xs text-gray-500">
                      {message.ttsData.provider} • {message.ttsData.voice_profile} • {message.ttsData.emotion_context}
                      {message.ttsData.duration_seconds && (
                        <> • {message.ttsData.duration_seconds.toFixed(1)}s</>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md rounded-lg rounded-bl-none px-4 py-2 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>🎤</span>
            <span>{isLoading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          🔊 Voice responses powered by Murf.ai • Secure & Private
        </p>
      </form>
    </div>
  );
}