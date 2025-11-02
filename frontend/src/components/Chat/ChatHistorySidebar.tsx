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
  currentSessionId?: string;
}

export default function ChatHistorySidebar({
  isOpen,
  onToggle,
  onSessionSelect,
  currentSessionId
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

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
      general: 'bg-blue-100 text-blue-800 border-blue-200',
      academic: 'bg-green-100 text-green-800 border-green-200',
      family: 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
        animate={{ width: 48 }}
        className="border-r border-gray-200 bg-gray-50 flex flex-col items-center py-4"
      >
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Open chat history"
        >
          <History className="w-5 h-5 text-gray-600" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 320 }}
      exit={{ width: 0 }}
      className="border-r border-gray-200 bg-gray-50 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
            <button 
              onClick={loadSessions}
              className="block mt-2 text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
            {error.includes('log in') && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="block mt-2 text-red-800 underline hover:text-red-900"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No chat history yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a conversation to see it here</p>
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
            <div key={group} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {groupLabels[group]}
                </h3>
              </div>

              <div className="space-y-2">
                {groupSessions.map(session => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onSessionSelect(session.id)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all
                      border-2 group relative
                      ${currentSessionId === session.id 
                        ? 'bg-blue-50 border-blue-300 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Context Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full border font-medium
                        ${getContextColor(session.session_type)}
                      `}>
                        {getContextIcon(session.session_type)} {session.session_type}
                      </span>
                      
                      {session.intervention_triggered && (
                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Preview */}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {session.first_message_preview || 'No messages'}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {session.message_count}
                      </span>
                      <span>{formatTime(session.started_at)}</span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="
                        absolute top-2 right-2 p-1.5 rounded-md
                        bg-white border border-gray-200
                        opacity-0 group-hover:opacity-100
                        hover:bg-red-50 hover:border-red-300
                        transition-all
                      "
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-600" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <button
          onClick={loadSessions}
          className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>
    </motion.div>
  );
}
