import React from 'react';
import type { JournalEntry } from '../types/journal';

interface JournalCardProps {
  entry: JournalEntry;
  index: number;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  moodOptions: Record<string, { emoji: string; label: string; color: string }>;
  predefinedTags: Record<string, string>;
}

const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  index,
  onEdit,
  onDelete,
  onToggleExpand,
  moodOptions,
  predefinedTags
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return formatDate(date);
  };

  const mood = moodOptions[entry.mood] || moodOptions.neutral;
  const isExpanded = entry.isExpanded || false;
  const wordCount = entry.wordCount || entry.content.split(' ').length;
  
  const shouldTruncate = entry.content.length > 150;
  const displayContent = isExpanded || !shouldTruncate 
    ? entry.content 
    : `${entry.content.substring(0, 150)}...`;

  return (
    <div 
      className="group bg-white/70 backdrop-blur-lg rounded-3xl p-6 border-2 border-purple-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:border-purple-300/60 hover:bg-white/80 animate-fade-in-up transform hover:-translate-y-2"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="p-3 rounded-2xl shadow-lg border-2 border-white/50"
            style={{ 
              background: `linear-gradient(135deg, ${mood.color}20, ${mood.color}40)`,
              borderColor: `${mood.color}30`
            }}
          >
            <span className="text-2xl">{mood.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 mb-1 truncate group-hover:text-purple-700 transition-colors">
              {entry.title}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <time className="text-gray-500 font-medium">
                {formatRelativeTime(entry.createdAt)}
              </time>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-gray-500">{wordCount} words</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Edit entry"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Delete entry"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => onToggleExpand(entry.id)}
            className="mt-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Read more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {entry.tags.map((tag, tagIndex) => {
            const tagColor = predefinedTags[tag] || 'bg-gray-100 text-gray-700';
            return (
              <span
                key={tagIndex}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${tagColor} transition-all hover:scale-105`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-200/50">
        <div className="flex items-center gap-2">
          <span className="font-medium">{mood.label}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{formatDate(entry.createdAt)}</span>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => onToggleExpand(entry.id)}
            className="text-gray-400 hover:text-purple-500 transition-colors"
            title="Toggle expand"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalCard;