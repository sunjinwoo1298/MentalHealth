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
    <>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        /* Custom slider styles */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: currentColor;
          height: 12px;
          border-radius: 6px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: #ffffff;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        
        input[type="range"]::-moz-range-track {
          background: currentColor;
          height: 12px;
          border-radius: 6px;
          border: none;
        }
        
        input[type="range"]::-moz-range-thumb {
          background: #ffffff;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-300 to-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-150"></div>
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
            <div className="fixed top-20 right-4 bg-gradient-to-r from-emerald-400 to-teal-500 backdrop-blur-md rounded-xl px-6 py-4 border border-emerald-300 shadow-2xl z-50 max-w-sm transform animate-bounce">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <p className="text-white text-sm font-semibold">Mood logged! You earned 8 points 🎉</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8 transform animate-fade-in-down">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl px-8 py-6 border border-white/50 mb-4 shadow-2xl max-w-fit mx-auto hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300">
                  📊
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">Mood Tracker</h1>
                  <p className="text-xl font-semibold text-gray-700">Track Your Emotional Journey</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg">Monitor your emotional wellbeing • Earn 8 points per entry</p>
          </div>

          {!isLogging ? (
            <div className="space-y-8">
              
              {/* Today's Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Today's Logs */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">📅</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Today ({todayLogs.length} logs)</h3>
                  </div>
                  {todayLogs.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-3 animate-bounce">📊</div>
                      <p className="text-gray-500 text-sm">No logs today</p>
                      <p className="text-gray-400 text-xs mt-1">Start your first log!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayLogs.slice(0, 3).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100 transform hover:scale-105 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getMoodEmoji(log.mood)}</span>
                            <div>
                              <span className="text-sm font-semibold text-gray-800">{log.time}</span>
                              <div className="text-xs text-teal-600 font-medium">
                                Mood: {log.mood}/10
                              </div>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getMoodColor(log.mood)} animate-pulse`}></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weekly Average */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">📈</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Weekly Average</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Mood</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getMoodEmoji(weeklyAvg.mood)}</span>
                        <span className="text-gray-800 font-bold">{weeklyAvg.mood}/10</span>
                        <div className={`w-2 h-6 rounded-full bg-gradient-to-t ${getMoodColor(weeklyAvg.mood)}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Energy</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 font-bold">{weeklyAvg.energy}/10</span>
                        <div className="w-2 h-6 rounded-full bg-gradient-to-t from-yellow-400 to-orange-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Anxiety</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-800 font-bold">{weeklyAvg.anxiety}/10</span>
                        <div className="w-2 h-6 rounded-full bg-gradient-to-t from-red-400 to-pink-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Log Button */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                  <div className="text-5xl mb-4 animate-bounce">🎯</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Ready to Check In?</h3>
                  <button
                    onClick={() => setIsLogging(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📊</span>
                      <span>Log Mood</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Recent Logs */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Recent Logs ({logs.length} total)</h3>
                </div>
                
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-bounce">📈</div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Start Your Journey</h4>
                    <p className="text-gray-500">Track your mood to see patterns and insights!</p>
                    <p className="text-gray-400 text-sm mt-2">Your emotional data will help you understand yourself better</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {logs.slice(0, 6).map((log, index) => (
                      <div key={log.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{getMoodEmoji(log.mood)}</span>
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r ${getMoodColor(log.mood)} animate-pulse`}></div>
                            </div>
                            <div>
                              <div className="text-gray-800 font-bold">Mood: {log.mood}/10</div>
                              <div className="text-xs text-gray-500 font-medium">{formatDate(log.date)} at {log.time}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Entry #{logs.length - index}</div>
                          </div>
                        </div>
                        
                        {log.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {log.emotions.slice(0, 3).map((emotion) => {
                              const emotionData = emotionOptions.find(e => e.name === emotion);
                              return (
                                <span key={emotion} className="text-xs px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full font-medium border border-indigo-200">
                                  {emotionData?.emoji} {emotion}
                                </span>
                              );
                            })}
                            {log.emotions.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                +{log.emotions.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">⚡</span>
                            <span className="text-gray-600 font-medium">Energy: {log.energy}/10</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">😰</span>
                            <span className="text-gray-600 font-medium">Anxiety: {log.anxiety}/10</span>
                          </div>
                        </div>
                        
                        {log.notes && (
                          <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-gray-600 italic">"{log.notes.slice(0, 60)}{log.notes.length > 60 ? '...' : ''}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* Mood Logging Interface */
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-white/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Log Your Current Mood</h3>
                </div>
                <button
                  onClick={() => setIsLogging(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                
                {/* Mood Scale */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <label className="block text-gray-800 font-semibold mb-4 text-lg">
                    Overall Mood: {currentLog.mood}/10 - {moodLabels[currentLog.mood - 1]}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl transform hover:scale-125 transition-transform duration-300">{getMoodEmoji(currentLog.mood)}</div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentLog.mood}
                      onChange={(e) => setCurrentLog(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                      className="flex-1 h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, 
                          #fee2e2 0%, #fed7aa 20%, #fef3c7 40%, 
                          #d9f99d 60%, #a7f3d0 80%, #a5f3fc 100%)`
                      }}
                    />
                    <div className="text-gray-800 font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {currentLog.mood}
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getMoodColor(currentLog.mood)} text-white shadow-lg`}>
                      {moodLabels[currentLog.mood - 1]}
                    </div>
                  </div>
                </div>

                {/* Energy Scale */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                  <label className="block text-gray-800 font-semibold mb-4 text-lg">
                    Energy Level: {currentLog.energy}/10 - {energyLabels[currentLog.energy - 1]}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl transform hover:scale-125 transition-transform duration-300">⚡</div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentLog.energy}
                      onChange={(e) => setCurrentLog(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                      className="flex-1 h-3 bg-gradient-to-r from-gray-300 via-yellow-300 to-orange-400 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-gray-800 font-bold text-xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      {currentLog.energy}
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                      {energyLabels[currentLog.energy - 1]}
                    </div>
                  </div>
                </div>

                {/* Anxiety Scale */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                  <label className="block text-gray-800 font-semibold mb-4 text-lg">
                    Anxiety Level: {currentLog.anxiety}/10 - {anxietyLabels[currentLog.anxiety - 1]}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl transform hover:scale-125 transition-transform duration-300">😰</div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentLog.anxiety}
                      onChange={(e) => setCurrentLog(prev => ({ ...prev, anxiety: parseInt(e.target.value) }))}
                      className="flex-1 h-3 bg-gradient-to-r from-green-300 via-yellow-300 to-red-400 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-gray-800 font-bold text-xl bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      {currentLog.anxiety}
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg">
                      {anxietyLabels[currentLog.anxiety - 1]}
                    </div>
                  </div>
                </div>

                {/* Emotions */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <label className="block text-gray-800 font-semibold mb-4 text-lg">
                    Select Emotions ({currentLog.emotions.length} selected)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {emotionOptions.map((emotion) => (
                      <button
                        key={emotion.name}
                        onClick={() => toggleEmotion(emotion.name)}
                        className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          currentLog.emotions.includes(emotion.name)
                            ? `bg-gradient-to-r ${emotion.color} text-white border-white shadow-lg scale-105`
                            : 'bg-white/70 border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <span className="text-xl">{emotion.emoji}</span>
                        <span className="text-sm font-semibold">{emotion.name}</span>
                      </button>
                    ))}
                  </div>
                  {currentLog.emotions.length > 0 && (
                    <div className="mt-4 p-3 bg-white/70 rounded-xl border border-purple-200">
                      <p className="text-sm text-gray-600 font-medium">Selected emotions:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentLog.emotions.map((emotion) => {
                          const emotionData = emotionOptions.find(e => e.name === emotion);
                          return (
                            <span key={emotion} className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${emotionData?.color}`}>
                              {emotionData?.emoji} {emotion}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Triggers */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                  <label className="block text-gray-800 font-semibold mb-4 text-lg">
                    Triggers (Optional) - {currentLog.triggers.length} selected
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {triggerOptions.map((trigger) => (
                      <button
                        key={trigger}
                        onClick={() => toggleTrigger(trigger)}
                        className={`p-3 rounded-xl border-2 text-sm transition-all duration-300 transform hover:scale-105 font-medium ${
                          currentLog.triggers.includes(trigger)
                            ? 'bg-gradient-to-r from-orange-400 to-red-400 border-orange-300 text-white shadow-lg scale-105'
                            : 'bg-white/70 border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        {trigger}
                      </button>
                    ))}
                  </div>
                  {currentLog.triggers.length > 0 && (
                    <div className="mt-4 p-3 bg-white/70 rounded-xl border border-orange-200">
                      <p className="text-sm text-gray-600 font-medium">Selected triggers:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentLog.triggers.map((trigger) => (
                          <span key={trigger} className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-orange-400 to-red-400">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
                  <label className="block text-gray-800 font-semibold mb-3 text-lg">Additional Notes (Optional)</label>
                  <textarea
                    value={currentLog.notes}
                    onChange={(e) => setCurrentLog(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Share any thoughts, context, or details about your current emotional state..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-md rounded-xl border-2 border-green-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 resize-none transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    {currentLog.notes.length}/500 characters
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setIsLogging(false)}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMoodLog}
                    className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
                  >
                    <span>💾</span>
                    <span>Save Mood Log</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">+8 points</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
};

export default MoodPage;