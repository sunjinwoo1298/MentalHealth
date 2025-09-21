import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
  tags: string[];
  createdAt: string;
}

const JournalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addPendingReward } = useGamification();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral' as JournalEntry['mood'],
    tags: [] as string[]
  });
  const [isWriting, setIsWriting] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

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

  const predefinedTags = [
    'Gratitude', 'Anxiety', 'Joy', 'Stress', 'Growth', 'Relationships',
    'Goals', 'Challenges', 'Self-care', 'Meditation', 'Dreams', 'Fear',
    'Love', 'Work', 'Family', 'Health', 'Creativity', 'Mindfulness'
  ];

  const moodEmojis = {
    'very-sad': '😢',
    'sad': '😔',
    'neutral': '😐',
    'happy': '🙂',
    'very-happy': '😊'
  };

  const moodLabels = {
    'very-sad': 'Very Sad',
    'sad': 'Sad',
    'neutral': 'Neutral',
    'happy': 'Happy',
    'very-happy': 'Very Happy'
  };

  const journalPrompts = [
    "What am I grateful for today?",
    "What challenged me today and how did I handle it?",
    "What did I learn about myself today?",
    "How am I feeling right now and why?",
    "What small victory can I celebrate today?",
    "What would I like to let go of?",
    "What are three things that went well today?",
    "How can I show myself more compassion?",
    "What am I looking forward to?",
    "What patterns do I notice in my thoughts today?"
  ];

  const addTag = (tag: string) => {
    if (tag && !currentEntry.tags.includes(tag)) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setSelectedTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const saveEntry = () => {
    if (currentEntry.title.trim() && currentEntry.content.trim()) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        ...currentEntry,
        createdAt: new Date().toISOString()
      };

      const updatedEntries = [newEntry, ...entries];
      saveEntries(updatedEntries);

      // Award points for journal entry
      addPendingReward('journal_entry', {
        entryId: newEntry.id,
        wordCount: currentEntry.content.split(' ').length,
        mood: currentEntry.mood,
        tags: currentEntry.tags,
        completedAt: new Date().toISOString()
      });

      // Reset form
      setCurrentEntry({
        title: '',
        content: '',
        mood: 'neutral',
        tags: []
      });
      setIsWriting(false);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mix-blend-soft-light filter blur-3xl"></div>
      </div>

      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />

      <main className="relative z-10 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Notification */}
          {showSuccess && (
            <div className="fixed top-20 right-4 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-md rounded-lg px-6 py-4 border border-emerald-400/50 shadow-xl z-50 max-w-sm animate-pulse">
              <p className="text-white text-sm font-medium">✨ Journal entry saved! You earned 15 points 🎉</p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-purple-400/30 mb-4 shadow-lg max-w-fit mx-auto">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xl shadow-md">
                  📝
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-purple-300 mb-1">Personal Journal</h1>
                  <p className="text-xl font-bold text-white">Reflect & Grow</p>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-lg">Write your thoughts, feelings, and experiences • Earn 15 points per entry</p>
          </div>

          {!isWriting ? (
            <div className="space-y-6">
              
              {/* New Entry Button */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-8 border border-purple-400/30 text-center">
                <div className="text-6xl mb-4">✍️</div>
                <h3 className="text-xl font-bold text-white mb-4">Start a New Entry</h3>
                <p className="text-gray-300 mb-6">Express your thoughts and feelings in a safe, private space</p>
                <button
                  onClick={() => setIsWriting(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  📝 Write New Entry
                </button>
              </div>

              {/* Writing Prompts */}
              <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-teal-400/30">
                <h3 className="text-lg font-bold text-white mb-4">✨ Writing Prompts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {journalPrompts.slice(0, 6).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentEntry(prev => ({ ...prev, content: prompt + '\n\n' }));
                        setIsWriting(true);
                      }}
                      className="text-left p-3 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg border border-teal-400/20 hover:border-teal-400/40 transition-all duration-300 text-teal-200 hover:text-white text-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Previous Entries */}
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-orange-400/30">
                <h3 className="text-lg font-bold text-white mb-4">📚 Previous Entries ({entries.length})</h3>
                
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📖</div>
                    <p className="text-gray-300">No entries yet. Start your journaling journey!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {entries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="bg-orange-500/10 rounded-lg p-4 border border-orange-400/20">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{entry.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{moodEmojis[entry.mood]}</span>
                            <span className="text-xs text-gray-400">{formatDate(entry.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{entry.content}</p>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-orange-400/20 text-orange-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* Writing Interface */
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-8 border border-purple-400/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">✍️ New Journal Entry</h3>
                <button
                  onClick={() => setIsWriting(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="space-y-6">
                
                {/* Title */}
                <div>
                  <label className="block text-white font-medium mb-2">Entry Title</label>
                  <input
                    type="text"
                    value={currentEntry.title}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your entry a meaningful title..."
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-white font-medium mb-2">Your Thoughts</label>
                  <textarea
                    value={currentEntry.content}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write freely about your thoughts, feelings, experiences, or anything on your mind..."
                    rows={12}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {currentEntry.content.split(' ').length} words
                  </div>
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="block text-white font-medium mb-2">How are you feeling?</label>
                  <div className="flex space-x-3">
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <button
                        key={mood}
                        onClick={() => setCurrentEntry(prev => ({ ...prev, mood: mood as JournalEntry['mood'] }))}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-300 ${
                          currentEntry.mood === mood
                            ? 'bg-purple-500/20 border-purple-400/50 text-white'
                            : 'bg-white/10 border-white/20 text-gray-400 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        <span className="text-2xl mb-1">{emoji}</span>
                        <span className="text-xs">{moodLabels[mood as keyof typeof moodLabels]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-white font-medium mb-2">Tags (Optional)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center px-3 py-1 bg-purple-400/20 text-purple-300 text-sm rounded-full border border-purple-400/30"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">Add a tag...</option>
                      {predefinedTags.filter(tag => !currentEntry.tags.includes(tag)).map((tag) => (
                        <option key={tag} value={tag} className="bg-gray-800">{tag}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => addTag(selectedTag)}
                      disabled={!selectedTag}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsWriting(false)}
                    className="px-6 py-3 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEntry}
                    disabled={!currentEntry.title.trim() || !currentEntry.content.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    💾 Save Entry (+15 points)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JournalPage;