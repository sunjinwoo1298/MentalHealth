import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  MessageCircle,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

interface ChatSession {
  id: string;
  session_type: string;
  status: string;
  started_at: string;
  ended_at?: string;
  message_count: number;
  first_message_preview?: string;
  mood_before?: number;
  mood_after?: number;
  intervention_triggered: boolean;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  currentSessionId?: string;
}

export default function ChatHistorySidebar({
  isOpen,
  onToggle,
  onSessionSelect,
  onNewChat,
  currentSessionId
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, currentSessionId]); // Re-fetch when sidebar opens or current session changes

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found');
        setError('Please log in to view chat history');
        setSessions([]);
        setLoading(false);
        return;
      }

      console.log('🔍 Loading chat sessions with token...');
      const response = await api.get('/chat/sessions', {
        params: { limit: 20 }
      });

      console.log('📦 Full API response:', response.data);
      console.log('📊 Chat sessions loaded:', response.data.sessions?.length || 0);
      console.log('📝 Sessions data:', response.data.sessions);
      setSessions(response.data.sessions || []);
    } catch (err: any) {
      console.error('❌ Error loading sessions:', err);
      console.error('❌ Error response:', err.response?.data);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      alert('Failed to delete session');
    }
  };

  const getContextIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      general: '💙',
      academic: '📚',
      family: '🏠'
    };
    return icons[type] || '💙';
  };

  const getContextColor = (type: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      academic: 'bg-green-500/20 text-green-200 border-green-400/30',
      family: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
    };
    return colors[type] || colors.general;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const groupSessionsByDate = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    sessions.forEach(session => {
      const sessionDate = new Date(session.started_at);
      if (sessionDate >= today) {
        groups.today.push(session);
      } else if (sessionDate >= yesterday) {
        groups.yesterday.push(session);
      } else if (sessionDate >= weekAgo) {
        groups.thisWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(sessions);

  // Collapsed state
  if (!isOpen) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 56 }}
        className="bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-4 gap-3"
      >
        <button
          onClick={onToggle}
          className="p-2.5 hover:bg-white/10 rounded-lg transition-all duration-200"
          title="Open chat history"
        >
          <ChevronRight className="w-5 h-5 text-white/80" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 360, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <History className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white drop-shadow-lg">Chat History</h2>
              <p className="text-xs text-white/60">
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">{loading && (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-500/30 border-t-purple-400"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-sm text-red-200 backdrop-blur-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium mb-2">{error}</p>
                <button 
                  onClick={loadSessions}
                  className="px-3 py-1.5 bg-red-400/20 hover:bg-red-400/30 rounded-lg transition-all text-xs font-medium"
                >
                  Try again
                </button>
                {error.includes('log in') && (
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="ml-2 px-3 py-1.5 bg-red-400/20 hover:bg-red-400/30 rounded-lg transition-all text-xs font-medium"
                  >
                    Go to Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4 relative">
              <MessageCircle className="w-16 h-16 text-white/20 mx-auto" />
              <div className="absolute inset-0 bg-purple-500/10 blur-3xl"></div>
            </div>
            <p className="text-sm text-white/70 font-medium">No chat history yet</p>
            <p className="text-xs text-white/40 mt-2">Start a conversation to see it here</p>
          </div>
        )}

        {!loading && !error && Object.entries(groupedSessions).map(([group, groupSessions]) => {
          if (groupSessions.length === 0) return null;

          const groupLabels: { [key: string]: string } = {
            today: 'Today',
            yesterday: 'Yesterday',
            thisWeek: 'This Week',
            older: 'Older'
          };

          return (
            <div key={group} className="mb-5">
              <div className="flex items-center gap-2 px-2 py-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-purple-300/60" />
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  {groupLabels[group]}
                </h3>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <div className="space-y-2.5">
                {groupSessions.map(session => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSessionSelect(session.id)}
                    className={`
                      p-3.5 rounded-xl cursor-pointer transition-all duration-200
                      border backdrop-blur-md group relative overflow-hidden
                      ${currentSessionId === session.id 
                        ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/20'
                      }
                    `}
                  >
                    {/* Active indicator glow */}
                    {currentSessionId === session.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl -z-10"></div>
                    )}

                    {/* Context Badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`
                        text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur-sm
                        ${getContextColor(session.session_type)}
                      `}>
                        {getContextIcon(session.session_type)} {session.session_type}
                      </span>
                      
                      {session.intervention_triggered && (
                        <span className="text-xs text-yellow-300/80 flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Preview */}
                    <p className="text-sm text-white/80 line-clamp-2 mb-2.5 leading-relaxed">
                      {session.first_message_preview || 'No messages'}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="font-medium">{session.message_count}</span>
                      </span>
                      <span className="font-medium">{formatTime(session.started_at)}</span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="
                        absolute top-2 right-2 p-1.5 rounded-lg
                        bg-black/40 backdrop-blur-md border border-white/10
                        opacity-0 group-hover:opacity-100
                        hover:bg-red-500/30 hover:border-red-400/50
                        transition-all duration-200
                      "
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/70 hover:text-red-300" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
        <button
          onClick={() => {
            onNewChat();
            onToggle(); // Close sidebar after creating new chat
          }}
          className="w-full py-2.5 text-sm text-white font-semibold bg-gradient-to-r from-purple-500/40 to-blue-500/40 hover:from-purple-500/50 hover:to-blue-500/50 rounded-lg transition-all duration-200 border border-purple-400/30 hover:border-purple-400/50 backdrop-blur-sm shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
        >
          <span className="text-lg">➕</span>
          <span>New Chat</span>
        </button>
      </div>
    </motion.div>
  );
}
