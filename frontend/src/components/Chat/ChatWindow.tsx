import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

// const SOCKET_URL = process.env.VITE_API_URL?.replace('3000', '3001') || 'http://localhost:3001';
// const socket = io(SOCKET_URL, { autoConnect: false });

export type ChatMessage = {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
};

const systemWelcome: ChatMessage = {
  id: 'system-welcome',
  type: 'system',
  text: 'You are now connected to MindCare AI. All conversations are private and monitored for your safety.',
  timestamp: new Date().toISOString(),
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([systemWelcome]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   socket.connect();
  //   socket.on('chat:message', (msg: ChatMessage) => {
  //     setMessages((prev) => [...prev, msg]);
  //   });
  //   socket.on('chat:system', (msg: ChatMessage) => {
  //     setMessages((prev) => [...prev, msg]);
  //   });
  //   socket.on('chat:typing', (typing: boolean) => {
  //     setIsTyping(typing);
  //   });
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    
    // Notify avatar of new message
    window.dispatchEvent(new CustomEvent('chatMessage', { 
      detail: { message: msg } 
    }));
    
    // socket.emit('chat:message', msg);
    setInput('');
    setIsTyping(true);
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[80%]">
              {msg.type !== 'user' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <span className="text-gray-400 text-sm">MindCare AI</span>
                </div>
              )}
              <div
                className={`px-6 py-4 rounded-2xl shadow-lg ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-pink-500 to-teal-500 text-white ml-auto'
                    : msg.type === 'ai'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : 'bg-gray-700/50 border border-gray-600 text-gray-300'
                }`}
              >
                {msg.type === 'system' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-semibold text-blue-300">🔒 SECURE CONNECTION</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <span className="block text-xs opacity-75 mt-2">
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
                <span className="text-gray-400 text-sm">MindCare AI</span>
              </div>
              <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                  <span className="text-sm">I'm thinking about your message...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      {/* Enhanced Input Area */}
      <div className="p-6 border-t border-gray-700/50">
        <form onSubmit={sendMessage} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-gray-400 text-sm backdrop-blur-sm transition-all duration-300"
                placeholder="Share what's on your mind..."
                autoFocus
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <span className="text-xs">Press Enter to send</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-teal-500 text-white font-semibold shadow-lg hover:from-pink-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                onClick={() => setInput(suggestion)}
                className="px-4 py-2 rounded-full bg-gray-700/50 border border-gray-600 text-gray-300 text-xs hover:bg-gray-600/50 hover:border-pink-400/50 transition-all duration-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
