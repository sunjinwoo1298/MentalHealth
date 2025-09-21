import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';

interface MoodLog {
  id: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  emotions: string[];
  notes: string;
  triggers: string[];
  date: string;
  time: string;
}

const MoodPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addPendingReward } = useGamification();
  
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentLog, setCurrentLog] = useState({
    mood: 5,
    energy: 5,
    anxiety: 3,
    emotions: [] as string[],
    notes: '',
    triggers: [] as string[]
  });

  const handleLogout = async () => {
    await logout();
  };

  // Load logs from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem(`mood_logs_${user?.id}`);
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, [user?.id]);

  // Save logs to localStorage
  const saveLogs = (newLogs: MoodLog[]) => {
    setLogs(newLogs);
    localStorage.setItem(`mood_logs_${user?.id}`, JSON.stringify(newLogs));
  };

  const emotionOptions = [
    { name: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
    { name: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-400' },
    { name: 'Anxious', emoji: '😰', color: 'from-red-400 to-pink-400' },
    { name: 'Excited', emoji: '🤗', color: 'from-pink-400 to-purple-400' },
    { name: 'Angry', emoji: '😠', color: 'from-red-500 to-red-600' },
    { name: 'Peaceful', emoji: '😌', color: 'from-green-400 to-teal-400' },
    { name: 'Confused', emoji: '😕', color: 'from-gray-400 to-gray-500' },
    { name: 'Grateful', emoji: '🙏', color: 'from-purple-400 to-pink-400' },
    { name: 'Lonely', emoji: '😔', color: 'from-indigo-400 to-blue-500' },
    { name: 'Motivated', emoji: '💪', color: 'from-green-500 to-emerald-500' },
    { name: 'Overwhelmed', emoji: '😵', color: 'from-orange-500 to-red-500' },
    { name: 'Content', emoji: '☺️', color: 'from-teal-400 to-cyan-400' }
  ];

  const triggerOptions = [
    'Work stress', 'Relationship', 'Family', 'Health', 'Finance', 'Social media',
    'Sleep issues', 'Weather', 'News', 'Academic pressure', 'Social situations',
    'Exercise', 'Food', 'Travel', 'Technology', 'Time pressure'
  ];

  const moodLabels = [
    'Terrible', 'Very Bad', 'Bad', 'Poor', 'Below Average',
    'Average', 'Good', 'Very Good', 'Great', 'Excellent'
  ];

  const energyLabels = [
    'Exhausted', 'Very Low', 'Low', 'Below Average', 'Moderate',
    'Average', 'Good', 'High', 'Very High', 'Energetic'
  ];

  const anxietyLabels = [
    'Very Calm', 'Calm', 'Relaxed', 'Slightly Tense', 'Moderate',
    'Worried', 'Anxious', 'Very Anxious', 'Highly Anxious', 'Panic'
  ];

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😔';
    if (mood <= 6) return '😐';
    if (mood <= 8) return '🙂';
    return '😊';
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return 'from-red-500 to-red-600';
    if (mood <= 4) return 'from-orange-500 to-red-500';
    if (mood <= 6) return 'from-yellow-500 to-orange-500';
    if (mood <= 8) return 'from-green-500 to-teal-500';
    return 'from-teal-500 to-emerald-500';
  };

  const toggleEmotion = (emotion: string) => {
    setCurrentLog(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const toggleTrigger = (trigger: string) => {
    setCurrentLog(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const saveMoodLog = () => {
    const newLog: MoodLog = {
      id: Date.now().toString(),
      ...currentLog,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    const updatedLogs = [newLog, ...logs];
    saveLogs(updatedLogs);

    // Award points for mood logging
    addPendingReward('mood_logging', {
      logId: newLog.id,
      mood: newLog.mood,
      energy: newLog.energy,
      anxiety: newLog.anxiety,
      emotionCount: newLog.emotions.length,
      completedAt: new Date().toISOString()
    });

    // Reset form
    setCurrentLog({
      mood: 5,
      energy: 5,
      anxiety: 3,
      emotions: [],
      notes: '',
      triggers: []
    });
    setIsLogging(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTodayLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(log => log.date === today);
  };

  const getWeeklyAverage = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLogs = logs.filter(log => new Date(log.date) >= weekAgo);
    
    if (weekLogs.length === 0) return { mood: 0, energy: 0, anxiety: 0 };
    
    return {
      mood: Math.round(weekLogs.reduce((sum, log) => sum + log.mood, 0) / weekLogs.length),
      energy: Math.round(weekLogs.reduce((sum, log) => sum + log.energy, 0) / weekLogs.length),
      anxiety: Math.round(weekLogs.reduce((sum, log) => sum + log.anxiety, 0) / weekLogs.length)
    };
  };

  const todayLogs = getTodayLogs();
  const weeklyAvg = getWeeklyAverage();

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
              <p className="text-white text-sm font-medium">🎯 Mood logged! You earned 8 points 🎉</p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-teal-400/30 mb-4 shadow-lg max-w-fit mx-auto">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-xl shadow-md">
                  📊
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-teal-300 mb-1">Mood Tracker</h1>
                  <p className="text-xl font-bold text-white">Track Your Emotions</p>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-lg">Monitor your emotional wellbeing • Earn 8 points per entry</p>
          </div>

          {!isLogging ? (
            <div className="space-y-6">
              
              {/* Today's Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Today's Logs */}
                <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-teal-400/30">
                  <h3 className="text-lg font-bold text-white mb-4">📅 Today ({todayLogs.length} logs)</h3>
                  {todayLogs.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-3xl mb-2">📊</div>
                      <p className="text-gray-300 text-sm">No logs today</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todayLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2 bg-teal-500/10 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getMoodEmoji(log.mood)}</span>
                            <span className="text-sm text-white">{log.time}</span>
                          </div>
                          <div className="text-xs text-teal-300">
                            Mood: {log.mood}/10
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weekly Average */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
                  <h3 className="text-lg font-bold text-white mb-4">📈 Weekly Average</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Mood</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMoodEmoji(weeklyAvg.mood)}</span>
                        <span className="text-white font-medium">{weeklyAvg.mood}/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Energy</span>
                      <span className="text-white font-medium">{weeklyAvg.energy}/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Anxiety</span>
                      <span className="text-white font-medium">{weeklyAvg.anxiety}/10</span>
                    </div>
                  </div>
                </div>

                {/* New Log Button */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-orange-400/30 text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-lg font-bold text-white mb-3">Check In</h3>
                  <button
                    onClick={() => setIsLogging(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    📊 Log Mood
                  </button>
                </div>
              </div>

              {/* Recent Logs */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-400/30">
                <h3 className="text-lg font-bold text-white mb-4">📋 Recent Logs ({logs.length} total)</h3>
                
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📈</div>
                    <p className="text-gray-300">Start tracking your mood to see patterns and insights!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {logs.slice(0, 6).map((log) => (
                      <div key={log.id} className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-400/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getMoodEmoji(log.mood)}</span>
                            <div>
                              <div className="text-white font-medium">Mood: {log.mood}/10</div>
                              <div className="text-xs text-gray-400">{formatDate(log.date)} at {log.time}</div>
                            </div>
                          </div>
                        </div>
                        
                        {log.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {log.emotions.slice(0, 3).map((emotion) => {
                              const emotionData = emotionOptions.find(e => e.name === emotion);
                              return (
                                <span key={emotion} className="text-xs px-2 py-1 bg-indigo-400/20 text-indigo-300 rounded-full">
                                  {emotionData?.emoji} {emotion}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                          <div>Energy: {log.energy}/10</div>
                          <div>Anxiety: {log.anxiety}/10</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* Mood Logging Interface */
            <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-8 border border-teal-400/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">📊 Log Your Current Mood</h3>
                <button
                  onClick={() => setIsLogging(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="space-y-8">
                
                {/* Mood Scale */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Overall Mood: {currentLog.mood}/10 - {moodLabels[currentLog.mood - 1]}
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getMoodEmoji(currentLog.mood)}</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentLog.mood}
                      onChange={(e) => setCurrentLog(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-medium w-8">{currentLog.mood}</span>
                  </div>
                </div>

                {/* Energy Scale */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Energy Level: {currentLog.energy}/10 - {energyLabels[currentLog.energy - 1]}
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">⚡</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentLog.energy}
                      onChange={(e) => setCurrentLog(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-medium w-8">{currentLog.energy}</span>
                  </div>
                </div>

                {/* Anxiety Scale */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Anxiety Level: {currentLog.anxiety}/10 - {anxietyLabels[currentLog.anxiety - 1]}
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">😰</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentLog.anxiety}
                      onChange={(e) => setCurrentLog(prev => ({ ...prev, anxiety: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-medium w-8">{currentLog.anxiety}</span>
                  </div>
                </div>

                {/* Emotions */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Select Emotions ({currentLog.emotions.length} selected)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {emotionOptions.map((emotion) => (
                      <button
                        key={emotion.name}
                        onClick={() => toggleEmotion(emotion.name)}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${
                          currentLog.emotions.includes(emotion.name)
                            ? `bg-gradient-to-r ${emotion.color} text-white border-white/50`
                            : 'bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        <span className="text-lg">{emotion.emoji}</span>
                        <span className="text-sm font-medium">{emotion.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Triggers */}
                <div>
                  <label className="block text-white font-medium mb-4">
                    Triggers (Optional) - {currentLog.triggers.length} selected
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {triggerOptions.map((trigger) => (
                      <button
                        key={trigger}
                        onClick={() => toggleTrigger(trigger)}
                        className={`p-2 rounded-lg border text-sm transition-all duration-300 ${
                          currentLog.triggers.includes(trigger)
                            ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                            : 'bg-white/10 border-white/20 text-gray-400 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        {trigger}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-white font-medium mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={currentLog.notes}
                    onChange={(e) => setCurrentLog(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional thoughts, context, or details about your current state..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsLogging(false)}
                    className="px-6 py-3 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMoodLog}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    💾 Save Mood Log (+8 points)
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

export default MoodPage;