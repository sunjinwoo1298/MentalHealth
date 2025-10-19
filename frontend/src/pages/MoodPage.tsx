import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';

interface QuickMoodData {
  emotions: { [key: string]: number };
  triggers: string[];
  notes: string;
  timestamp: string;
}

const MoodPage: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [quickMoodLogs, setQuickMoodLogs] = useState<QuickMoodData[]>([]);

  const handleLogout = async () => {
    await logout();
  };

  // Load quick mood logs from localStorage
  useEffect(() => {
    const quickLogs = localStorage.getItem('quickMoodLogs');
    if (quickLogs) {
      setQuickMoodLogs(JSON.parse(quickLogs));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Get today's quick mood logs
  const today = new Date().toISOString().split('T')[0];
  const todayQuickLogs = quickMoodLogs.filter(log => 
    log.timestamp && log.timestamp.startsWith(today)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/30 to-pink-900/20"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)`
      }}></div>

      <Navigation 
        isAuthenticated={!!user} 
        user={user || undefined} 
        onLogout={handleLogout}
      />

      <main className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                📊 Mood History
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              View your emotional wellbeing patterns and insights
            </p>
            <div className="mt-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-full px-6 py-2 border border-indigo-400/30 inline-block">
              <span className="text-indigo-300 font-medium">
                Use the Quick Mood Tracker on your dashboard to log new entries
              </span>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Today's Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Today's Quick Mood Logs */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
                <h3 className="text-lg font-bold text-white mb-4">📅 Today's Mood Check-ins ({todayQuickLogs.length} entries)</h3>
                {todayQuickLogs.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">🎯</div>
                    <p className="text-gray-300 text-sm">No mood check-ins today</p>
                    <p className="text-gray-400 text-xs mt-1">Use the dashboard widget to track your mood</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayQuickLogs.slice(0, 5).map((log, index) => (
                      <div key={index} className="p-3 bg-purple-500/10 rounded-lg border border-purple-400/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">Mood Check</span>
                          <span className="text-xs text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(log.emotions).map(([emotion, value]) => value > 0 && (
                            <div key={emotion} className="flex items-center justify-between">
                              <span className="text-xs text-purple-300">{emotion}</span>
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={`w-2 h-2 rounded-full ${
                                      i < value ? 'bg-purple-400' : 'bg-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {log.triggers.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {log.triggers.slice(0, 3).map((trigger, idx) => (
                                <span key={idx} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Summary */}
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-md rounded-2xl p-6 border border-orange-400/30">
                <h3 className="text-lg font-bold text-white mb-4">📈 This Week's Insights</h3>
                {quickMoodLogs.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-gray-300 text-sm">Start tracking to see insights</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-300">{quickMoodLogs.length}</div>
                      <div className="text-sm text-gray-300">Total mood check-ins</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400 mb-1">Most tracked emotions:</div>
                      {(() => {
                        const emotionCounts: { [key: string]: number } = {};
                        quickMoodLogs.forEach(log => {
                          Object.entries(log.emotions).forEach(([emotion, value]) => {
                            if (value > 0) {
                              emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                            }
                          });
                        });
                        return Object.entries(emotionCounts)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([emotion, count]) => (
                            <div key={emotion} className="flex justify-between text-sm">
                              <span className="text-orange-300">{emotion}</span>
                              <span className="text-white">{count}x</span>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* All Quick Mood Check-ins */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
              <h3 className="text-lg font-bold text-white mb-4">📋 All Mood Check-ins ({quickMoodLogs.length} total)</h3>
              
              {quickMoodLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎯</div>
                  <h4 className="text-white font-bold mb-2">Start Your Mood Journey</h4>
                  <p className="text-gray-300 mb-4">Use the Quick Mood Tracker on your dashboard to start logging!</p>
                  <div className="bg-purple-500/10 rounded-lg p-4 mt-4">
                    <p className="text-purple-200 text-sm">
                      💡 <strong>How it works:</strong> Go to your dashboard and use the Quick Mood Check widget to track your 5 main emotions and any triggers you're experiencing.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {quickMoodLogs.map((log, index) => (
                    <div key={index} className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-white font-medium text-sm">Mood Check #{quickMoodLogs.length - index}</div>
                        <div className="text-xs text-gray-400">
                          {formatDate(log.timestamp)} at {new Date(log.timestamp).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {Object.keys(log.emotions).length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-400 mb-2">Emotions (0-5 scale):</div>
                          <div className="space-y-1">
                            {Object.entries(log.emotions).map(([emotion, value]) => value > 0 && (
                              <div key={emotion} className="flex items-center justify-between">
                                <span className="text-xs text-purple-300">{emotion}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <div 
                                        key={i} 
                                        className={`w-2 h-2 rounded-full ${
                                          i < value ? 'bg-purple-400' : 'bg-gray-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-white">{value}/5</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {log.triggers.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-400 mb-1">Triggers:</div>
                          <div className="flex flex-wrap gap-1">
                            {log.triggers.map((trigger, idx) => (
                              <span key={idx} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {log.notes && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Notes:</div>
                          <p className="text-xs text-gray-300 bg-purple-500/5 p-2 rounded">"{log.notes}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default MoodPage;