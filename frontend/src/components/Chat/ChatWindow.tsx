import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.VITE_API_URL?.replace('3000', '3001') || 'http://localhost:3001';
const socket = io(SOCKET_URL, { autoConnect: false });

export type ChatMessage = {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
};

const systemWelcome = {
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

  useEffect(() => {
    socket.connect();
    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('chat:system', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('chat:typing', (typing: boolean) => {
      setIsTyping(typing);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

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
    socket.emit('chat:message', msg);
    setInput('');
    setIsTyping(true);
  };

  return (
    <div className="max-w-xl mx-auto my-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-3 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-4 py-2 rounded-xl text-sm max-w-[70%] animate-fade-in-up ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg'
                  : msg.type === 'ai'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow'
              }`}
            >
              {msg.type === 'system' && (
                <span className="font-semibold text-xs text-blue-600 dark:text-blue-300 mr-2">System</span>
              )}
              {msg.text}
              <span className="block text-xs text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="mb-3 flex justify-start">
            <div className="px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg animate-pulse">
              MindCare AI is typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Type your message..."
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}
