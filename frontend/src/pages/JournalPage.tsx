import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  Search, 
  Edit3, 
  Trash2, 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  Sun, 
  Moon, 
  Star,
  Zap,
  Plus
} from 'lucide-react';
import type { JournalEntry, JournalFormData, MoodOption } from '../types/journal';

const JournalPage: React.FC = () => {
  const { user } = useAuth();
  const { addPendingReward } = useGamification();
  
  // Core state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  
  // Form state for inline writing
  const [formData, setFormData] = useState<JournalFormData>({
    title: '',
    content: '',
    mood: 'neutral',
    tags: []
  });
  
  // Filter and search state
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [activeMoodFilter, setActiveMoodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modern mood system with Lucide icons
  const moodOptions: Record<string, MoodOption> = {
    'ecstatic': { emoji: <Star className="w-5 h-5" />, label: 'Ecstatic', color: '#ff6b6b' },
    'joyful': { emoji: <Smile className="w-5 h-5" />, label: 'Joyful', color: '#4ecdc4' },
    'grateful': { emoji: <Heart className="w-5 h-5" />, label: 'Grateful', color: '#45b7d1' },
    'peaceful': { emoji: <Sun className="w-5 h-5" />, label: 'Peaceful', color: '#96ceb4' },
    'content': { emoji: <Smile className="w-5 h-5" />, label: 'Content', color: '#ffeaa7' },
    'neutral': { emoji: <Meh className="w-5 h-5" />, label: 'Neutral', color: '#ddd6fe' },
    'pensive': { emoji: <Moon className="w-5 h-5" />, label: 'Pensive', color: '#fd79a8' },
    'melancholy': { emoji: <Frown className="w-5 h-5" />, label: 'Melancholy', color: '#6c5ce7' }
  };

  // Modern tag system
  const predefinedTags = [
    { name: 'Reflection', color: 'bg-gradient-to-r from-purple-500 to-pink-500', textColor: 'text-white' },
    { name: 'Growth', color: 'bg-gradient-to-r from-green-400 to-blue-500', textColor: 'text-white' },
    { name: 'Gratitude', color: 'bg-gradient-to-r from-pink-500 to-rose-500', textColor: 'text-white' },
    { name: 'Goals', color: 'bg-gradient-to-r from-orange-400 to-pink-400', textColor: 'text-white' },
    { name: 'Mindfulness', color: 'bg-gradient-to-r from-indigo-500 to-purple-500', textColor: 'text-white' },
    { name: 'Wellness', color: 'bg-gradient-to-r from-teal-400 to-cyan-500', textColor: 'text-white' },
    { name: 'Creativity', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', textColor: 'text-white' },
    { name: 'Relationships', color: 'bg-gradient-to-r from-red-400 to-pink-500', textColor: 'text-white' }
  ];

  // Filter entries based on active filters
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMood = activeMoodFilter === 'all' || entry.mood === activeMoodFilter;
    
    const now = new Date();
    const entryDate = new Date(entry.createdAt);
    let matchesDate = true;
    
    if (activeFilter === 'today') {
      matchesDate = entryDate.toDateString() === now.toDateString();
    } else if (activeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = entryDate >= weekAgo;
    } else if (activeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = entryDate >= monthAgo;
    }
    
    return matchesSearch && matchesMood && matchesDate;
  });

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem(`journal_entries_${user?.id}`);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, [user?.id]);

  // Save entries to localStorage
  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(`journal_entries_${user?.id}`, JSON.stringify(newEntries));
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Tag management
  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Save journal entry
  const saveEntry = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    setIsLoading(true);
    try {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        wordCount: formData.content.split(' ').length
      };

      const updatedEntries = [newEntry, ...entries];
      saveEntries(updatedEntries);

      // Award points for journal entry
      addPendingReward('journal_entry', {
        entryId: newEntry.id,
        wordCount: newEntry.wordCount,
        mood: newEntry.mood,
        tags: newEntry.tags,
        completedAt: new Date().toISOString()
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        mood: 'neutral',
        tags: []
      });

      setIsWriting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-8 w-64 h-64 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Modern Header with Proper Alignment */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-purple-200 shadow-sm">
          <div className="mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section - Back Button and Title */}
              <div className="flex items-center space-x-6">
                {/* Back to Dashboard Button - Properly Aligned */}
                {/* <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex items-center justify-center space-x-3 px-3 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg min-w-[140px]"
                >
                  <ArrowLeft/>
                </button> */}
                
                {/* Title Section - Properly Aligned */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">My Journal</h1>
                    <p className="text-gray-600 text-sm font-medium">Reflect, grow, and track your journey</p>
                  </div>
                </div>
                
                {/* Stats - Properly Aligned */}
                {entries.length > 0 && (
                  <div className="hidden lg:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl">
                      <div className="text-lg font-bold text-emerald-700">{entries.length}</div>
                      <div className="text-xs text-emerald-600 font-medium">Entries</div>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                      <div className="text-lg font-bold text-blue-700">
                        {entries.reduce((acc, entry) => acc + (entry.wordCount || entry.content.split(' ').length), 0)}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">Words</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Section - Search and New Entry */}
              <div className="flex items-center space-x-4">
                {/* Search - Properly Aligned */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-3 bg-white/90 border-2 border-purple-200 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm shadow-sm font-medium"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-purple-400" />
                </div>
                
                {/* New Entry Button - Properly Aligned */}
                <button
                  onClick={() => setIsWriting(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>New Entry</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Horizontal Layout */}
        <div className="flex h-[calc(100vh-100px)]">
          
          {/* Left Sidebar - Entry List with Proper Alignment */}
          <div className="w-96 border-r border-purple-200 bg-white/60 backdrop-blur-sm overflow-hidden flex flex-col">
            
            {/* Filter Tabs - Properly Aligned */}
            <div className="p-6 border-b border-pink-200">
              <div className="flex space-x-2">
                {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all capitalize ${
                      activeFilter === filter
                        ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 border-2 border-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Filter - Properly Aligned */}
            <div className="p-6 border-b border-purple-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Filter by Mood</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveMoodFilter('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeMoodFilter === 'all'
                      ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  All Moods
                </button>
                {Object.entries(moodOptions).map(([mood, { emoji }]) => (
                  <button
                    key={mood}
                    onClick={() => setActiveMoodFilter(mood)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-lg transition-all border-2 ${
                      activeMoodFilter === mood
                        ? 'bg-gradient-to-r from-yellow-200 to-orange-200 scale-110 border-orange-300 shadow-lg'
                        : 'hover:scale-105 bg-white/70 hover:bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry List - Properly Aligned */}
            <div className="flex-1 overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-semibold">No entries found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {filteredEntries.map((entry, index) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 ${
                        selectedEntry?.id === entry.id
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-lg transform scale-[1.02]'
                          : 'bg-white/80 hover:bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                      }`}
                    >
                      {/* Entry Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${moodOptions[entry.mood]?.color}20` }}
                          >
                            {moodOptions[entry.mood]?.emoji}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{formatDate(entry.createdAt)}</span>
                        </div>
                      </div>
                      
                      {/* Entry Content */}
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{entry.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{entry.content}</p>
                      
                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.slice(0, 3).map((tag, idx) => {
                            const tagStyle = predefinedTags.find(t => t.name === tag);
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  tagStyle ? `${tagStyle.color} ${tagStyle.textColor}` : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                          {entry.tags.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">+{entry.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {isWriting ? (
              /* Writing Mode */
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-200 shadow-2xl">
                    
                    {/* Writing Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Create New Entry</h2>
                      </div>
                      <button
                        onClick={() => setIsWriting(false)}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Title Input */}
                      <div>
                        <label className="block text-gray-800 font-bold mb-2 text-lg">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="What's on your mind today?"
                          className="w-full p-4 border-2 border-purple-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/70 backdrop-blur-sm font-medium text-lg"
                        />
                      </div>

                      {/* Content Textarea */}
                      <div>
                        <label className="block text-gray-800 font-bold mb-2 text-lg">Your Thoughts</label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Share your thoughts, feelings, experiences, or reflections..."
                          rows={12}
                          className="w-full p-4 border-2 border-purple-200 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none bg-white/70 backdrop-blur-sm font-medium leading-relaxed"
                        />
                        <div className="text-right text-sm text-gray-500 mt-2 font-medium">
                          {formData.content.split(' ').filter(word => word.length > 0).length} words
                        </div>
                      </div>

                      {/* Mood Selector */}
                      <div>
                        <label className="block text-gray-800 font-bold mb-3 text-lg">How are you feeling?</label>
                        <div className="grid grid-cols-4 gap-3">
                          {Object.entries(moodOptions).map(([mood, { emoji, label }]) => (
                            <button
                              key={mood}
                              onClick={() => setFormData(prev => ({ ...prev, mood }))}
                              className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                                formData.mood === mood
                                  ? 'bg-gradient-to-r from-purple-200 to-pink-200 border-purple-400 shadow-lg transform scale-105'
                                  : 'bg-white/70 hover:bg-white border-gray-200 hover:border-purple-200 shadow-sm hover:shadow-md'
                              }`}
                            >
                              <div className="flex justify-center mb-2 text-2xl">
                                {emoji}
                              </div>
                              <div className="text-xs font-bold text-gray-800">{label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-gray-800 font-bold mb-3 text-lg">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 rounded-full text-sm font-medium flex items-center shadow-sm border border-purple-300"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-2 text-purple-600 hover:text-purple-800 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {predefinedTags
                            .filter(tag => !formData.tags.includes(tag.name))
                            .map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={() => addTag(tag.name)}
                              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-md border-2 border-transparent hover:border-white/50 ${tag.color} ${tag.textColor}`}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end space-x-4 pt-6">
                        <button
                          onClick={() => setIsWriting(false)}
                          className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEntry}
                          disabled={!formData.title.trim() || !formData.content.trim() || isLoading}
                          className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <Sparkles className="w-5 h-5" />
                          <span>{isLoading ? 'Saving...' : 'Save Entry'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedEntry ? (
              /* Reading Mode */
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-200 shadow-2xl">
                    
                    {/* Entry Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center border-3 shadow-lg"
                          style={{ 
                            backgroundColor: `${moodOptions[selectedEntry.mood]?.color}30`,
                            borderColor: `${moodOptions[selectedEntry.mood]?.color}`
                          }}
                        >
                          {moodOptions[selectedEntry.mood]?.emoji}
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedEntry.title}</h1>
                          <div className="flex items-center space-x-4 text-gray-600 text-sm font-medium">
                            <span>{formatDate(selectedEntry.createdAt)}</span>
                            <span>•</span>
                            <span>{selectedEntry.wordCount || selectedEntry.content.split(' ').length} words</span>
                            <span>•</span>
                            <span className="capitalize">{moodOptions[selectedEntry.mood]?.label}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-3 text-gray-600 hover:text-purple-600 transition-all duration-300 hover:bg-purple-100 rounded-xl">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button className="p-3 text-gray-600 hover:text-red-500 transition-all duration-300 hover:bg-red-100 rounded-xl">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Entry Content */}
                    <div className="prose prose-lg max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                        {selectedEntry.content}
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedEntry.tags.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-purple-200">
                        <div className="flex flex-wrap gap-3">
                          {selectedEntry.tags.map((tag, idx) => {
                            const tagStyle = predefinedTags.find(t => t.name === tag);
                            return (
                              <span
                                key={idx}
                                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                                  tagStyle ? `${tagStyle.color} ${tagStyle.textColor}` : 'bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800'
                                }`}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-lg">
                  <BookOpen className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Journal</h3>
                  <p className="text-gray-600 text-lg mb-8 font-medium leading-relaxed">
                    {entries.length === 0 
                      ? "Start your journaling journey by creating your first entry."
                      : "Select an entry from the sidebar to read it, or create a new one."
                    }
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setIsWriting(true)}
                      className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                      <Edit3 className="w-5 h-5" />
                      <span>{entries.length === 0 ? 'Write Your First Entry' : 'Create New Entry'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-300 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">Entry Saved!</div>
                  <div className="text-sm text-emerald-100 font-medium">Your thoughts have been captured</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPage;