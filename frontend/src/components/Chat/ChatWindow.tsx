import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useVrmAvatar } from '../../hooks/useVrmAvatar';
import { EmotionControls } from '../VrmControls';

export type ChatMessage = {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  userId?: string;
};

const systemWelcome: ChatMessage = {
  id: 'system-welcome',
  type: 'system',
  text: 'You are now connected to MindCare AI. All conversations are private and monitored for your safety.',
  timestamp: new Date().toISOString(),
};

// Initialize socket outside the component to avoid multiple connections
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  secure: false, // Set to true for HTTPS
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([systemWelcome]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // VRM Avatar integration
  const {
    canvasRef,
    currentEmotion,
    isLoading: vrmLoading,
    isTransitioning,
    switchToEmotion
  } = useVrmAvatar();

  // Auto-switch avatar emotions based on conversation
  const updateAvatarEmotion = (messageText: string, messageType: 'user' | 'ai') => {
    if (vrmLoading || isTransitioning) {
      return;
    }

    const text = messageText.toLowerCase();
    
    if (messageType === 'ai') {
      // AI is responding - show empathetic/happy expression
      switchToEmotion('neutral');
    } else if (messageType === 'user') {
      // Analyze user message sentiment
      if (text.includes('sad') || text.includes('depressed') || text.includes('down')) {
        switchToEmotion('neutral'); // Compassionate listening
      } else if (text.includes('angry') || text.includes('frustrated') || text.includes('mad')) {
        switchToEmotion('neutral'); // Calm, understanding
      } else if (text.includes('happy') || text.includes('good') || text.includes('great')) {
        switchToEmotion('neutral'); // Share the joy
      } else {
        switchToEmotion('neutral'); // Default neutral listening pose
      }
    }
  };

  useEffect(() => {
    // Connect to socket
    socket.connect();

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
      
      // Join user room (using socket.id as temporary user ID)
      socket.emit('join_room', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      console.log('Received message:', msg);
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
      
      // Update avatar emotion based on message
      updateAvatarEmotion(msg.text, msg.type as 'user' | 'ai');
    });

    socket.on('chat:system', (msg: ChatMessage) => {
      console.log('Received system message:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('chat:typing', (typing: boolean) => {
      console.log('Typing indicator:', typing);
      setIsTyping(typing);
      
      // When AI starts typing, show thinking expression
      if (typing) {
        switchToEmotion('neutral');
      }
    });

    socket.on('chat:error', (error: { message: string }) => {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        text: error.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat:message');
      socket.off('chat:system');
      socket.off('chat:typing');
      socket.off('chat:error');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) {
      return;
    }
    
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
      userId: socket.id,
    };

    // Update avatar emotion based on user message
    updateAvatarEmotion(msg.text, 'user');

    // Emit message to server
    socket.emit('chat:message', msg);
    
    // Notify avatar of new message
    window.dispatchEvent(new CustomEvent('chatMessage', { 
      detail: { message: msg } 
    }));
    
    setInput('');
  };

  return (
    <div className="h-full relative bg-transparent overflow-hidden">
      {/* VRM Avatar Background - Full Screen */}
      <div className="absolute inset-0">
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ 
            background: 'transparent',
            display: 'block'
          }}
        />
        
        {/* Avatar Loading Indicator */}
        {vrmLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <span className="text-sm">Loading Avatar...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Overlay - Positioned over avatar */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Emotion Controls - Top Left */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          {/* <EmotionControls
            currentEmotion={currentEmotion}
            isLoading={vrmLoading}
            isTransitioning={isTransitioning}
            onEmotionChange={switchToEmotion}
          /> */}
        </div>

        {/* Connection Status - Top Center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
          <span className={`text-xs px-3 py-1 rounded-full backdrop-blur-md ${
            isConnected 
              ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
              : 'bg-red-500/30 text-red-300 border border-red-500/50'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        {/* Chat Messages - Center/Bottom Area */}
        <div className="flex-1 flex flex-col justify-end p-6 pointer-events-none">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pointer-events-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[30%]">
                  {msg.type !== 'user' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">AI</span>
                      </div>
                      <span className="text-white/90 text-sm drop-shadow-lg">MindCare AI</span>
                    </div>
                  )}
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-pink-500/80 to-teal-500/80 text-white ml-auto border-pink-300/30'
                        : msg.type === 'ai'
                        ? 'bg-gradient-to-r from-purple-500/80 to-indigo-600/80 text-white border-purple-300/30'
                        : 'bg-gray-800/60 border-gray-500/40 text-gray-100'
                    }`}
                  >
                    {msg.type === 'system' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-blue-300">🔒 SECURE CONNECTION</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed drop-shadow-sm">{msg.text}</p>
                    <span className="block text-xs opacity-75 mt-2 drop-shadow-sm">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
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
                      <span className="text-sm drop-shadow-sm">I'm thinking about your message...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        
        {/* Input Area - Bottom */}
        <div className="p-6 bg-gradient-to-t from-black/40 via-black/20 to-transparent backdrop-blur-none pointer-events-auto">
          <form onSubmit={sendMessage} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!isConnected}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-900/60 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-pink-400/70 focus:border-transparent text-white placeholder-gray-300 text-sm backdrop-blur-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  placeholder={isConnected ? "Share what's on your mind..." : "Connecting..."}
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-xs drop-shadow-sm">Press Enter to send</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || !isConnected}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500/90 to-teal-500/90 text-white font-semibold shadow-xl hover:from-pink-600/90 hover:to-teal-600/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-md border border-pink-300/30"
              >
                Send
              </button>
            </div>
            
            {/* Quick Response Suggestions */}
            <div className="flex flex-wrap gap-2">
              {['I feel anxious today', 'Can you help me relax?', 'I need someone to talk to'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={!isConnected}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-400/30 text-gray-200 text-xs hover:bg-gray-700/60 hover:border-pink-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
